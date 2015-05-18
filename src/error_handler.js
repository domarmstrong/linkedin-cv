/**
 * Handle any unexpected errors
 */
export function handleError (err) {
    logError(err);
}

export function logError (err) {
    console.error(err);
}
