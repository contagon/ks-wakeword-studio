"""Bounded candidate admission using measured, final unique-corpus yield."""
import math
import time
from collections import defaultdict
from dataclasses import dataclass


@dataclass
class Yield:
    generated: int = 0
    accepted: int = 0
    stalled: int = 0
    error: bool = False


class RefillBudget:
    def __init__(self, samples, *, max_candidates=None, max_seconds=21600, clock=time.monotonic):
        self.limit = max(1024, samples * 12) if max_candidates is None else max_candidates
        if type(self.limit) is not int or self.limit < 1 or not math.isfinite(max_seconds) or max_seconds <= 0:
            raise ValueError('Candidate and time budgets must be positive and finite')
        self.clock, self.deadline = clock, clock() + max_seconds
        self.attempted = 0
        self.yields = defaultdict(Yield)

    def stop_reason(self):
        if self.attempted >= self.limit:
            return 'candidate_budget'
        if self.clock() >= self.deadline:
            return 'time_budget'
        return None

    def eligible(self, engine):
        return self.yields[engine].stalled < 3

    def request(self, engine, missing, factor, *, refill=False, reference_count=None):
        if missing <= 0 or self.stop_reason() or not self.eligible(engine):
            return 0
        stats = self.yields[engine]
        if refill and stats.generated:
            requested = math.ceil(missing / max(.01, stats.accepted / stats.generated) * 1.2)
        else:
            requested = math.ceil(missing * factor)
        if refill:
            requested = max(128, requested)
        requested = min(requested, 20000, self.limit - self.attempted)
        return min(requested, reference_count) if reference_count is not None else requested

    def observe(self, engine, *, attempted, generated, accepted, error=False):
        self.attempted += attempted
        stats = self.yields[engine]
        stats.generated += generated
        stats.accepted += accepted
        stats.stalled = 0 if accepted else stats.stalled + 1
        stats.error = error
