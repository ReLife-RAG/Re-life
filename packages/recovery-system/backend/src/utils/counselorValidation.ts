import { ALLOWED_SPECIALIZATIONS } from '../models/Counselor';

export function ValidationCredentials(credentials: any) {
    const errors: string[] = [];

    if (!credentials) {
        errors.push('credentailas are required');
        return errors;
    }

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


    if (!credentials.license) {
        errors.push('license is required')
    }

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

export function ValidateSpecialization(specializations: any) {
    const errors: string[] = [];

    if (!Array.isArray(specializations)) {
        errors.push('specializations must be an array')
        return errors;
    }

    if (specializations.length === 0) {
        errors.push('specializations must have at least one item')
    }

    if (specializations.length > 10) {
        errors.push('you can select maximum 10 specializations')
    }

    for (const item of specializations) {
        if (!ALLOWED_SPECIALIZATIONS.includes(item)) {
            errors.push('invalid specialization: ' + item)
        }
    }

    return errors;
}

export function validationBio(bio: any) {
    const errors: string[] = [];

    if (!bio) {
        errors.push('bio is required');
    }
    else if (bio.length < 50) {
        errors.push('bio must be at least 50 characters long')
    }
    else if (bio.length > 2000) {
        errors.push('bio must be at most 2000 characters long')
    }

    return errors;
}