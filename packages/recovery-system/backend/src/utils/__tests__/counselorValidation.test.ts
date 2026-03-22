import {
  ValidateSpecialization,
  ValidationCredentials,
  validationBio,
} from '../counselorValidation';

describe('counselorValidation', () => {
  test('credentials validation catches required fields', () => {
    const errors = ValidationCredentials(undefined);
    expect(errors).toContain('credentailas are required');
  });

  test('credentials validation accepts valid payload', () => {
    const errors = ValidationCredentials({
      degree: 'BSc Psychology',
      license: 'LIC-12345',
      yearsOfExperience: 5,
    });

    expect(errors).toEqual([]);
  });

  test('specializations validation rejects invalid values', () => {
    const errors = ValidateSpecialization(['invalid_specialization']);
    expect(errors.some((e) => e.includes('invalid specialization'))).toBe(true);
  });

  test('specializations validation rejects non-array input', () => {
    const errors = ValidateSpecialization('not-an-array');
    expect(errors).toEqual(['specializations must be an array']);
  });

  test('bio validation enforces length boundaries', () => {
    expect(validationBio('short')).toContain('bio must be at least 50 characters long');
    expect(validationBio('a'.repeat(2001))).toContain('bio must be at most 2000 characters long');
    expect(validationBio('a'.repeat(60))).toEqual([]);
  });
});
