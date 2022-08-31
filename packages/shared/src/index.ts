export const isObject = (val)=> {
    return val !== null && typeof val === 'object'
}

export const isFunction = (val)=> {
    return typeof val === 'function'
}

export const isString = (val)=> {
    return typeof val === 'string'

}
export const isNumber = (val)=> {
    return typeof val === 'number'
}

export const isArray = Array.isArray
export const assign = Object.assign
