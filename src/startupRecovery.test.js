import { loadWithRetry, recoveryUrl } from './startupRecovery';

test('an interrupted chunk request retries once, then recovers',async()=>{
  const module={default:()=>null};
  const load=jest.fn().mockRejectedValueOnce(new Error('interrupted')).mockResolvedValue(module);
  const result=loadWithRetry(load);
  await expect(result).resolves.toBe(module);
  expect(load).toHaveBeenCalledTimes(2);
});

test('a persistent loading failure reaches the recovery UI rather than retrying forever',async()=>{
  const load=jest.fn().mockRejectedValue(new Error('offline'));
  await expect(loadWithRetry(load)).rejects.toThrow('offline');
  expect(load).toHaveBeenCalledTimes(2);
});

test('fresh reload bypasses cached HTML while keeping the requested route and options',()=>{
  expect(recoveryUrl('https://exoreray.github.io/?motion=off&chapter=apple#/milestones',123))
    .toBe('https://exoreray.github.io/?motion=off&chapter=apple&reload=123#/milestones');
});
