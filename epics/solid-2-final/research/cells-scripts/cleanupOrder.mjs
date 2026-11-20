// When does an onCleanup registered in a compute run, relative to the next compute?
const S = await import(`${process.argv[2]}/@solidjs/signals/dist/dev.js`)
const { createSignal, createRoot, createRenderEffect, createMemo, onCleanup, flush } = S
const order = []
const [x, setX] = createSignal(0)
createRoot(() => {
  createRenderEffect(
    () => {
      const v = x()
      order.push("effect compute " + v)
      onCleanup(() => order.push("effect compute cleanup " + v))
      return v
    },
    () => {}
  )
  const m = createMemo(() => {
    const v = x()
    order.push("memo compute " + v)
    onCleanup(() => order.push("memo cleanup " + v))
    return v
  })
  createRenderEffect(m, () => {})
})
flush()
setX(1)
flush()
console.log(order.join("\n"))
