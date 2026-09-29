function getRawSubtopic(task: {subtopic?: string; codifier?: string; explanation: string}) {
  if (task.subtopic !== undefined) return task.subtopic.trim();
  if (task.codifier) return task.codifier.trim();
  const match = task.explanation.match(/Раздел кодификатора(?:\s+ФИПИ)?\s*:\s*([^\n]*(?:\n(?!Источник|Тип|Сложность)[^\n]+)*)/i);
  return match?.[1].trim() ?? '';
}

// One task can cover several codifier sections. Never treat their combination
// as a new section in filters or count the same section twice for one task.
export function getTaskSubtopics(task: {subtopic?: string; codifier?: string; explanation: string}) {
  const sections = getRawSubtopic(task).split(/\s*[;\n]\s*(?=\d+\.\d+\s)/)
    .map(value => value.replace(/\s+/g, ' ').replace(/(?:\s+[А-ЯA-Z]){3,}\s*$/, '').replace(/[.;\s]+$/, '').trim())
    .filter(Boolean);
  return [...new Set(sections)];
}

export function getTaskSubtopic(task: {subtopic?: string; codifier?: string; explanation: string}) {
  return getTaskSubtopics(task).join('; ');
}

export function hasTaskSubtopic(task: {subtopic?: string; codifier?: string; explanation: string}, section: string) {
  const sections = getTaskSubtopics(task);
  return section === '' ? sections.length === 0 : sections.includes(section);
}

export function compareSubtopics(first: string, second: string) {
  if (!first) return second ? 1 : 0;
  if (!second) return -1;
  return first.localeCompare(second,'ru',{numeric:true});
}
