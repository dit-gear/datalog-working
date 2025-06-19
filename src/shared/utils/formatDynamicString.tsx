import { DatalogType } from '@shared/datalogTypes'
import { getFirstAndLastDatalogs } from '@shared/utils/datalog-merge'
import { format, parse } from 'date-fns'
import { getLatestLog } from './getLatestDatalog'
import { ProjectRootType } from '@shared/projectTypes'

export type Tags = {
  day?: number
  date?: string
  projectName?: string
  unit?: string
  log?: string
}

type TagFunction = (tags: Tags) => string

export function formatDate(
  date: string | Date = new Date(),
  dateFormat: string = 'yyyy-MM-dd'
): string {
  let parsedDate: Date
  if (typeof date === 'string') {
    parsedDate = parse(date, 'yyyy-MM-dd', new Date())
  } else {
    parsedDate = date
  }
  return format(parsedDate, dateFormat)
}

function formatNumber(day: number = 0, numberFormat: string = 'd'): string {
  return day.toString().padStart(numberFormat.length, '0')
}

function returnString(string: string = ''): string {
  return string
}

function replaceTags(template: string, tagsArray: Tags | [Tags, Tags]): string {
  const isRange = Array.isArray(tagsArray)
  const tagFunctions: Record<string, TagFunction> = {
    // Dates
    '<yyyymmdd>': (tag) => formatDate(tag.date, 'yyyyMMdd'),
    '<yymmdd>': (tag) => formatDate(tag.date, 'yyMMdd'),
    '<ddmmyyyy>': (tag) => formatDate(tag.date, 'ddMMyyyy'),
    '<ddmmyy>': (tag) => formatDate(tag.date, 'ddMMyy'),
    '<mmddyyyy>': (tag) => formatDate(tag.date, 'MMddyyyy'),
    '<mmddyy>': (tag) => formatDate(tag.date, 'MMddyy'),

    // Dates with hypthens
    '<yyyy-mm-dd>': (tag) => formatDate(tag.date, 'yyyy-MM-dd'),
    '<yy-mm-dd>': (tag) => formatDate(tag.date, 'yy-MM-dd'),
    '<dd-mm-yyyy>': (tag) => formatDate(tag.date, 'dd-MM-yyyy'),
    '<dd-mm-yy>': (tag) => formatDate(tag.date, 'dd-MM-yy'),
    '<mm-dd-yyyy>': (tag) => formatDate(tag.date, 'MM-dd-yyyy'),
    '<mm-dd-yy>': (tag) => formatDate(tag.date, 'MM-dd-yy'),

    //Days [1, 01, 001]
    '<d>': (tag) => formatNumber(tag.day, 'd'),
    '<dd>': (tag) => formatNumber(tag.day, 'dd'),
    '<ddd>': (tag) => formatNumber(tag.day, 'ddd'),

    //Others
    '<project>': (tag) => returnString(tag.projectName),
    '<unit>': (tag) => returnString(tag.unit),

    '<log>': (tag) => replaceTags(tag.log || '', tagsArray)
  }

  return template.replace(/<[^>]+>/g, (tag) => {
    const fn = tagFunctions[tag]
    if (!fn) return tag

    if (isRange) {
      const [a, b] = tagsArray as [Tags, Tags]
      return `${fn(a)}-${fn(b)}`
    } else {
      return fn(tagsArray as Tags)
    }
  })
}

export default replaceTags

const tags = (log: DatalogType, projectName: string): Tags => {
  return {
    day: log.day,
    date: log.date,
    projectName: projectName,
    unit: log.unit,
    log: log.id
  }
}

interface getFileNameProps {
  selection?: string[]
  logs: DatalogType[]
  template: string
  fallbackName: string
  project: ProjectRootType
}
export const replaceTagsMultiple = ({
  selection: _selection,
  logs,
  template,
  project,
  fallbackName
}: getFileNameProps): string => {
  if (!logs) return fallbackName
  const selection = logs.filter((log) => _selection?.includes(log.id))

  if (Array.isArray(selection) && selection.length > 1) {
    const { first, last } = getFirstAndLastDatalogs(selection)
    return replaceTags(template, [
      tags(first, project.project_name),
      tags(last, project.project_name)
    ])
  } else {
    const singleLog = !selection.length ? getLatestLog(logs, project) : selection[0]
    return replaceTags(template, tags(singleLog, project.project_name))
  }
}
