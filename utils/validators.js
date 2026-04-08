export function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }
  
  export function isPositiveInteger(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  }
  
  export function isNonNegativeNumber(value) {
    if (value === "" || value === null || value === undefined) return false;
    const num = Number(value);
    return Number.isFinite(num) && num >= 0;
  }
  
  export function isValidDateTime(value) {
    if (!value || typeof value !== "string") return false;
    return !Number.isNaN(new Date(value).getTime());
  }
  
  export function normaliseBoolean(value) {
    return value === true || value === "true";
  }
  
  export function validateCourseInput(body) {
    const errors = [];
  
    if (!isNonEmptyString(body.title)) {
      errors.push("Course title is required.");
    }
  
    if (!isNonEmptyString(body.level)) {
      errors.push("Course level is required.");
    } else if (!["beginner", "intermediate", "advanced"].includes(body.level)) {
      errors.push("Course level must be beginner, intermediate, or advanced.");
    }
  
    if (!isNonEmptyString(body.type)) {
      errors.push("Course type is required.");
    } else if (!["WEEKLY_BLOCK", "WEEKEND_WORKSHOP"].includes(body.type)) {
      errors.push("Course type must be WEEKLY_BLOCK or WEEKEND_WORKSHOP.");
    }
  
    if (!isNonEmptyString(body.description)) {
      errors.push("Course description is required.");
    }
  
    if (!isNonEmptyString(body.location)) {
      errors.push("Course location is required.");
    }
  
    if (!isNonNegativeNumber(body.price)) {
      errors.push("Course price must be a valid number of 0 or more.");
    }
  
    if (!isNonEmptyString(body.startDate)) {
      errors.push("Start date is required.");
    }
  
    if (!isNonEmptyString(body.endDate)) {
      errors.push("End date is required.");
    }
  
    if (
      isNonEmptyString(body.startDate) &&
      isNonEmptyString(body.endDate) &&
      new Date(body.startDate) > new Date(body.endDate)
    ) {
      errors.push("Start date cannot be after end date.");
    }
  
    return errors;
  }
  
  export function validateSessionInput(body) {
    const errors = [];
  
    if (!isValidDateTime(body.startDateTime)) {
      errors.push("Valid session start date/time is required.");
    }
  
    if (!isValidDateTime(body.endDateTime)) {
      errors.push("Valid session end date/time is required.");
    }
  
    if (!isPositiveInteger(body.capacity)) {
      errors.push("Capacity must be a positive whole number.");
    }
  
    if (
      isValidDateTime(body.startDateTime) &&
      isValidDateTime(body.endDateTime) &&
      new Date(body.startDateTime) >= new Date(body.endDateTime)
    ) {
      errors.push("Session end must be after the session start.");
    }
  
    return errors;
  }