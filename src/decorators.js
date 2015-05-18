/**
 * Having the value of 'this' bound can be usefull in instances like React components
 * where you want to be able to pass instance methods around without having to .bind
 *
 * ```
 * @bound
 * class Comp extends React.Component {
 *   handleClick (event) {
 *     console.log('clicked', this);
 *   }
 *
 *   render () {
 *     // with @bound
 *     return <div onClick={ this.handleClick } />;
 *     // without @bound
 *     return <div onClick={ this.handleClick.bind(this) } />;
 *   }
 * }
 * ```
 * The decorator may be used on classes or methods
 * ```
 * @bound
 * class FullBound {}
 *
 * class PartBound {
 *   @bound
 *   method () {}
 * }
 * ```
 */
export function bound(...args) {
    if (args.length === 1) {
        return boundClass(...args);
    } else {
        return boundMethod(...args);
    }
}

/**
 * Use boundMethod to bind all methods on the constructor.prototype
 */
function boundClass(constructor) {
    // (Using reflect to get all keys including symbols)
    Reflect.ownKeys(constructor.prototype).forEach(key => {
        // Ignore special case constructor method
        if (key === 'constructor') return;

        var descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, key);

        // Only methods need binding
        if (typeof descriptor.value === 'function') {
            Object.defineProperty(constructor.prototype, key, boundMethod(constructor, key, descriptor));
        }
    });
    return constructor;
}

/**
 * Return a decriptor removing the value and returning a getter
 * The getter will return a .bind version of the function
 * and memoize the result against a symbol on the instance
 */
function boundMethod(constructor, key, descriptor) {
    let _key;
    let fn = descriptor.value;

    if (typeof fn !== 'function') {
        throw new Error('Only methods may be @bound, received: ' + typeof fn);
    }

    if (typeof key === 'string') {
        // Add the key to the symbol name for easier debugging
        _key = Symbol('@bound method: ' + key);
    } else if (typeof key === 'symbol') {
        // A symbol cannot be coerced to a string
        _key = Symbol('@bound method: (symbol)');
    } else {
        throw new Error('Unexpected key type: ' + typeof key);
    }

    return {
        configurable: true,
        get () {
            if (! this.hasOwnProperty(_key)) {
                this[_key] = fn.bind(this);
            }
            return this[_key];
        }
    };
}
