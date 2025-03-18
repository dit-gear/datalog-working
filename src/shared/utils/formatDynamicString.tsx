import { DatalogType } from '@shared/datalogTypes'
import { getFirstAndLastDatalogs } from '@shared/utils/datalog-merge'
import { format, parse } from 'date-fns'

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

function replaceTags(template: string, tags: Tags): string {
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

    '<log>': (tag) => replaceTags(tag.log || '', tags)
  }

  return template.replace(/<[^>]+>/g, (tag) => {
    const tagFunction = tagFunctions[tag]
    return tagFunction ? tagFunction(tags) : tag
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
  selection: DatalogType | DatalogType[] | undefined
  template: string
  fallbackName: string
  projectName: string
}
export const replaceTagsMultiple = ({
  selection,
  template,
  fallbackName,
  projectName
}: getFileNameProps): string => {
  if (!selection) return fallbackName

  if (Array.isArray(selection) && selection.length > 1) {
    const { first, last } = getFirstAndLastDatalogs(selection)

    const firstName = replaceTags(template, tags(first, projectName))
    const lastName = replaceTags(template, tags(last, projectName))
    return `${firstName}-${lastName}`
  } else {
    const logs = Array.isArray(selection) ? selection[0] : selection
    return replaceTags(template, tags(logs, projectName))
  }
}
