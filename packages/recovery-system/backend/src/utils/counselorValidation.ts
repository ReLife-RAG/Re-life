import { ALLOWED_SPECIALIZATIONS } from '../models/Counselor';


// Validate counselor credentials
export function ValidationCredentials(credentials: any) {
    const errors: string[] = [];

    // Check if credentials object exists
    if (!credentials) {
        errors.push('credentailas are required');
        return errors;
    }

    // Validate degree
    if (!credentials.degree) {
        errors.push('degree is required')
    }
    else if (typeof credentials.degree !== 'string') {
        errors.push('degree must be a string')
    }
    else if (credentials.degree.length < 3) {
        errors.push('degree must be at least 3 characters long')
    }
    else if (credentials.degree.length > 200) {
        errors.push('degree must be at most 200 characters long')
    }

    // Validate license
    if (!credentials.license) {
        errors.push('license is required')
    }


    // Validate years of experience
    if (credentials.yearsOfExperience === undefined) {
        errors.push('years of experience is required')
    }
    else if (credentials.yearsOfExperience < 0) {
        errors.push('years of experience cannot be negative')
    }
    else if (credentials.yearsOfExperience > 70) {
        errors.push('years of experience cannot exceed 70')
    }

    return errors;
}

// Validate specializations array
export function ValidateSpecialization(specializations: any) {
    const errors: string[] = [];

    // Check if it is an array
    if (!Array.isArray(specializations)) {
        errors.push('specializations must be an array')
        return errors;
    }

    // Check if array is empty
    if (specializations.length === 0) {
        errors.push('specializations must have at least one item')
    }

    // Check if array has more than 10 items
    if (specializations.length > 10) {
        errors.push('you can select maximum 10 specializations')
    }

    // Check if each specialization is allowed
    for (const item of specializations) {
        if (!ALLOWED_SPECIALIZATIONS.includes(item)) {
            errors.push('invalid specialization: ' + item)
        }
    }

    return errors;
}


// Validate bio field
export function validationBio(bio: any) {
    const errors: string[] = [];

    // Check if bio exists
    if (!bio) {
        errors.push('bio is required');
    }
    // Check if bio is at least 50 characters long
    else if (bio.length < 50) {
        errors.push('bio must be at least 50 characters long')
    }
    // Check maximum length
    else if (bio.length > 2000) {
        errors.push('bio must be at most 2000 characters long')
    }

    return errors;
}