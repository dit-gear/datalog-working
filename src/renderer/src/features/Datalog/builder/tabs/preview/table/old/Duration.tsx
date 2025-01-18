import { useFormContext, useWatch } from 'react-hook-form'
//import { DurationPopupForm } from '../../stats/forms/DurationPopupForm'

const DurationCell = ({ row, column, value }) => {
  const { setValue } = useFormContext()
  const field = `clips.${row.id}.${column.id}`
  const valueInSync = useWatch({ name: field })
  const update = (newValue: number) => {
    setValue(field, newValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    })
  }
  return <span className="whitespace-nowrap">{valueInSync}</span>
}
export default DurationCell

/* <DurationPopupForm value={value} update={update} sec>
      <span className="whitespace-nowrap">{valueInSync}</span>
    </DurationPopupForm> */
