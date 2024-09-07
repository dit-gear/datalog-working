import { XMLParser, XMLValidator } from 'fast-xml-parser'
import logger from '../../logger'

export async function parseXML(fileData: string): Promise<any> {
  const options = {
    attributeNamePrefix: '',
    attrNodeName: false,
    textNodeName: 'text',
    ignoreAttributes: false,
    parseNodeValue: false,
    parseTagValue: false,
    parseAttributeValue: false
  }
  const XMLparser = new XMLParser(options)

  if (XMLValidator.validate(fileData) !== true) {
    const message = 'Invalid file'
    logger.error(message)
    throw new Error(message)
  }

  return XMLparser.parse(fileData)
}
