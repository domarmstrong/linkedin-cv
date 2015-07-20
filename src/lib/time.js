"use strict";

/**
 * Author: Dom Armstrong, Date: 20/07/15
 */

export default {
  /**
   * @param duration {Number} milliseconds
   * @returns human readable string
   */
  renderDuration (duration) {
    if (duration > 100) {
      return Number(duration / 1000).toFixed(2) + ' s';
    } else {
      return duration + ' ms';
    }
  }
}
