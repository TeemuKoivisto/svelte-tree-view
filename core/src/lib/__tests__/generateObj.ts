const keys = ['a', 'b', 'c']

function* valueGenerator() {
  let index = 0
  while (true) {
    switch (index % 8) {
      case 0:
        yield undefined
        break
      case 1:
        yield null
        break
      case 2:
        yield [0, 1, 3]
        break
      case 3:
        yield () => {
          console.log('hello world')
        }
        break
      case 4:
        yield new Date('2021-08-31T17:15:12.183Z')
        break
      case 5:
        yield true
        break
      case 6:
        yield 80085
        break
      case 7:
        yield 'a value I am'
        break
    }
    index += 1
  }
}

const generator = valueGenerator()

export function generateObj(depth: number, toDepth: number) {
  let obj: any
  if (depth === toDepth) {
    return generator.next().value
  } else if (depth === 0 || depth > 2) {
    obj = {}
    obj[`${depth}-${keys[0]}`] = generateObj(depth + 1, toDepth)
    obj[`${depth}-${keys[1]}`] = generateObj(depth + 1, toDepth)
    obj[`${depth}-${keys[2]}`] = obj[`${depth}-${keys[0]}`]
  } else if (depth === 1) {
    obj = new Map()
    obj.set(`${depth}-${keys[0]}`, generateObj(depth + 1, toDepth))
    obj.set([1, 2, 3], generateObj(depth + 1, toDepth))
    obj.set(`${depth}-${keys[2]}`, obj.get(`${depth}-${keys[0]}`))
  } else if (depth === 2) {
    obj = new Set()
    obj.add(generateObj(depth + 1, toDepth))
    obj.add(generateObj(depth + 1, toDepth))
    obj.add(`${depth}-${keys[2]}`)
  }
  return obj
}
