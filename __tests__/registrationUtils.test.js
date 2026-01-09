import { saveProgress, loadProgress, clearProgress, createResumeToken, getProgressByToken, removeResumeToken } from '../utils/registrationUtils';

describe('registrationUtils persistence', () => {
  beforeEach(() => { clearProgress(); });

  test('save and load progress', () => {
    const payload = { step: 2, form: { fullName: 'Ana' } };
    saveProgress(payload);
    const loaded = loadProgress();
    expect(loaded).toEqual(payload);
  });

  test('create and retrieve resume token', () => {
    const payload = { step: 3, form: { fullName: 'Bruna' } };
    const token = createResumeToken(payload, 1); // 1 minute
    expect(typeof token).toBe('string');
    const recovered = getProgressByToken(token);
    expect(recovered).toBeTruthy();
    expect(recovered.step).toBe(3);
    removeResumeToken(token);
    const after = getProgressByToken(token);
    expect(after).toBeNull();
  });
});
