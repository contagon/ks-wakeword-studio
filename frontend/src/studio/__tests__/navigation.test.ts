import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { useStudioRoutes } from '../routes';

it('aliases old scrape links to the Collect tab without losing workspace identity', () => {
  history.replaceState(null, '', '#/scrape?word=opaque-a');
  let state!: ReturnType<typeof useStudioRoutes>;
  const ui = mount({ setup() { state = useStudioRoutes(); }, template: '<div />' });
  expect(state.page.value).toBe('classify');
  expect(state.href('classify')).toContain('word=opaque-a');
  expect(state.href('classify')).toContain('tab=collect');
  ui.unmount();
});
