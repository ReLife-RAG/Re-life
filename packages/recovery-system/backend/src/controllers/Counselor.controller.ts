import { Request, Response } from 'express';
import Counselor from '../models/Counselor';
import { ValidationCredentials, ValidateSpecialization, validationBio } from '../utils/counselorValidation';

// POST /api/counselors
export const createCounselorProfile = async (req: Request, res: Response) => {
    try {

        // Get logged in user
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get data from body
        const credentials = req.body.credentials;
        const specializations = req.body.specializations;
        const bio = req.body.bio;
        const availability = req.body.availability;
        const profileImage = req.body.profileImage;

        // Check if profile already exists
        const existingProfile = await Counselor.findOne({ userId: user.id });
        if (existingProfile) {
            return res.status(400).json({ error: 'Counselor profile already exists' });
        }

        // Validate credentials
        const credentialErrors = ValidationCredentials(credentials);
        if (credentialErrors.length > 0) {
            return res.status(400).json({ error: 'Invalid credentials', details: credentialErrors });
        }

        // Check license is not already used
        const licenseExists = await Counselor.findOne({ 'credentials.license': credentials.license });
        if (licenseExists) {
            return res.status(400).json({ error: 'This license number is already registered' });
        }

        // Validate specializations
        const specializationErrors = ValidateSpecialization(specializations);
        if (specializationErrors.length > 0) {
            return res.status(400).json({ error: 'Invalid specializations', details: specializationErrors });
        }

        // Validate bio
        const bioErrors = validationBio(bio);
        if (bioErrors.length > 0) {
            return res.status(400).json({ error: 'Invalid bio', details: bioErrors });
        }

        // Create new counselor profile
        const counselor = new Counselor({
            userId: user.id,
            credentials: {
                degree: credentials.degree,
                license: credentials.license,
                licenseState: credentials.licenseState,
                yearsOfExperience: credentials.yearsOfExperience,
                certifications: credentials.certifications || [],
            },
            specializations: specializations,
            bio: bio,
            availability: availability || undefined,
            profileImage: profileImage || undefined,
        });

        // Save to database
        await counselor.save();

        // Send success response
        return res.status(201).json({
            message: 'Counselor profile created successfully',
            counselor: counselor,
        });

    } catch (error: any) {
        console.error('Error creating counselor profile:', error);

        if (error.code === 11000) {
            return res.status(400).json({ error: 'A profile with this license already exists' });
        }

        return res.status(500).json({ error: 'Failed to create counselor profile' });
    }
};

// GET /api/counselors/me
export const getCounselorProfile = async (req: Request, res: Response) => {
    try {

        // Get logged in user
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Find counselor profile in database
        const counselor = await Counselor.findOne({ userId: user.id });
        if (!counselor) {
            return res.status(404).json({ error: 'Counselor profile not found' });
        }

        // Send profile back
        return res.status(200).json({ counselor: counselor });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to get counselor profile' });
    }
};