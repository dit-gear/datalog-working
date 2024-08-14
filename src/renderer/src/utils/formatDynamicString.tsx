import { format } from 'date-fns'

type Tags = {
  day?: number
  date?: Date
  projectName?: string
  unit?: string
}

//type TagFunction = (state?: number, date?: Date, projectName?: string, unit?: string) => string
type TagFunction = (tags: Tags) => string

function formatDate(date: Date = new Date(), dateFormat: string = 'yyyyMMdd'): string {
  return format(date, dateFormat)
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
    '<yyyymmdd>': (tag) => formatDate(tag.date, 'yyyyMMdd'),
    '<yymmdd>': (tag) => formatDate(tag.date, 'yyMMdd'),
    '<ddmmyyyy>': (tag) => formatDate(tag.date, 'ddMMyyyy'),
    '<ddmmyy>': (tag) => formatDate(tag.date, 'ddMMyy'),
    '<mmddyyyy>': (tag) => formatDate(tag.date, 'MMddyyyy'),
    '<mmddyy>': (tag) => formatDate(tag.date, 'MMddyy'),
    '<d>': (tag) => formatNumber(tag.day, '<d>'),
    '<dd>': (tag) => formatNumber(tag.day, '<dd>'),
    '<ddd>': (tag) => formatNumber(tag.day, '<ddd>'),
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
