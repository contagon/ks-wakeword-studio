"""Atomic fan-out into independently selectable provider datasets."""
import json
from dataclasses import asdict, replace
from uuid import uuid4

import tts_config as tts
from studio.generation_references import reference_pool
from studio.models import GenerationSubmission, ValidationError


def submit(service, word_id, recipe):
    service._validate(recipe)
    if (type(recipe.moss_after_current) is not bool or not isinstance(recipe.moss_source_batch_ids, list)
            or (recipe.moss_samples is not None and (type(recipe.moss_samples) is not int or recipe.moss_samples < 1))):
        raise ValidationError('Invalid MOSS settings')
    engines = recipe.engines if recipe.engines is not None else tts.engines_for_language(
        recipe.language, recipe.tts_mode, piper_available=service._piper_available(recipe.language))
    direct = [e for e in engines if e != 'moss']
    moss = 'moss' in engines
    moss_count = recipe.moss_samples if recipe.moss_samples is not None else recipe.samples
    if not moss and (recipe.moss_after_current or recipe.moss_source_batch_ids):
        raise ValidationError('MOSS source settings require MOSS selected')
    if moss and recipe.moss_after_current:
        if not direct or recipe.moss_source_batch_ids:
            raise ValidationError('Generate after current selection requires direct providers and no existing source selection')
        if moss_count > len(direct) * recipe.samples:
            raise ValidationError('MOSS needs more distinct reference clips; select more providers or reduce MOSS samples')
    submission_id = uuid4().hex
    with service.store.transaction() as db:
        word = service._word(db, word_id)
        if moss and not recipe.moss_after_current:
            reference_pool(service, db, word_id, word['phrase'], recipe, moss_count)
        db.execute('INSERT INTO generation_recipes VALUES (?,?) ON CONFLICT(word_id) DO UPDATE SET recipe=excluded.recipe',
                   (word_id, json.dumps(asdict(recipe), sort_keys=True)))
        jobs = []

        def enqueue(child):
            job = service.jobs._enqueue(db, 'generation', word_id,
                {'phrase': word['phrase'], 'recipe': asdict(child), 'submission_id': submission_id,
                 'provider_dataset': True}, None, None, service.clock())
            db.execute('INSERT INTO generation_batches VALUES (?,?,?,?,NULL)',
                       (job.id, word_id, word['phrase'], json.dumps(asdict(child), sort_keys=True)))
            jobs.append(job)

        for provider in direct:
            enqueue(replace(recipe, engines=[provider], moss_source_batch_ids=[], moss_after_current=False, moss_samples=None))
        if moss:
            ids = [j.id for j in jobs] if recipe.moss_after_current else list(recipe.moss_source_batch_ids)
            enqueue(replace(recipe, engines=['moss'], samples=moss_count, moss_source_batch_ids=ids))
        return GenerationSubmission(submission_id, jobs, [j.id for j in jobs])
