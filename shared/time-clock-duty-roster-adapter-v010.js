(function (global) {
  'use strict';
  const VERSION = '0.1.0';
  function compare(actuals = [], planned = []) {
    const plan = new Map(planned.map(item => [item.personId, item]));
    return actuals.map(actual => {
      const target = plan.get(actual.personId);
      const plannedHours = Number(target?.hours || 0);
      return {...actual, plannedHours, varianceHours:Math.round((actual.hours - plannedHours) * 100) / 100, rosterMatch:Boolean(target)};
    });
  }
  global.KCTimeClockDutyRosterAdapter = Object.freeze({version:VERSION, schema:'KC_DUTY_ROSTER_ACTUALS_V1', compare});
})(window);
