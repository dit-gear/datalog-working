import { format, parse } from 'date-fns'

type Tags = {
  day?: number
  date?: string
  projectName?: string
  unit?: string
}

//type TagFunction = (state?: number, date?: Date, projectName?: string, unit?: string) => string
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

function formatNumber(day: number = 0, numberFormat: string = '<d>'): string {
  const length = numberFormat.length - 2
  return day.toString().padStart(length, '0')
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
    '<d>': (tag) => formatNumber(tag.day, '<d>'),
    '<dd>': (tag) => formatNumber(tag.day, '<dd>'),
    '<ddd>': (tag) => formatNumber(tag.day, '<ddd>'),

    //Others
    '<project>': (tag) => returnString(tag.projectName),
    '<unit>': (tag) => returnString(tag.unit)
  }

  return template.replace(/<[^>]+>/g, (tag) => {
    const tagFunction = tagFunctions[tag]
    return tagFunction ? tagFunction(tags) : tag
    //return tagFunction ? tagFunction(day, date) : tag
  })
}
export default replaceTags
