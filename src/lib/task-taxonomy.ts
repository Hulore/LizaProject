export function getTaskSubtopic(task: {subtopic?: string; codifier?: string; explanation: string}) {
  if (task.subtopic !== undefined) return task.subtopic.trim();
  if (task.codifier) return task.codifier.trim();
  const match = task.explanation.match(/Раздел кодификатора(?:\s+ФИПИ)?\s*:\s*([^\n]*(?:\n(?!Источник|Тип|Сложность)[^\n]+)*)/i);
  return match?.[1].replace(/\s+/g,' ').trim() ?? '';
}

export function compareSubtopics(first: string, second: string) {
  if (!first) return second ? 1 : 0;
  if (!second) return -1;
  return first.localeCompare(second,'ru',{numeric:true});
}
