import { XMLParser, XMLValidator } from 'fast-xml-parser'

export async function parseXML(fileData: string): Promise<any> {
  const options = {
    attributeNamePrefix: '',
    attrNodeName: false,
    textNodeName: 'text',
    ignoreAttributes: false,
    parseNodeValue: false,
    parseTagValue: false,
    parseAttributeValue: false
    //removeNSPrefix: true
  }
  const XMLparser = new XMLParser(options)

  if (XMLValidator.validate(fileData) !== true) {
    const message = 'Invalid file'
    throw new Error(message)
  }

  return XMLparser.parse(fileData)
}
