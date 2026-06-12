import * as Yup from 'yup';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/;


export const getValidationSchema = (formType) => {
  switch (formType) {

    case 'signup':
      return Yup.object().shape({
        name: Yup.string().trim().required('Name is required'),
        email: Yup.string()
          .trim()
          .matches(emailRegex, 'Invalid email format')
          .required('Email is required'),
        phone: Yup.string().required('Phone number is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirm_password: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords must match')
          .required('Confirm Password is required'),
        // agreeToTerms: Yup.boolean()
        //   .oneOf([true], 'You must agree to terms and conditions')
        //   .required('Terms agreement is required'),
      });

    case 'login':
      return Yup.object().shape({
        email: Yup.string()
          .transform(value => value.trim()) // Apply trim during validation
          .matches(emailRegex, 'Invalid email format')
          .required('Email is required'),
        password: Yup.string().required('Password is required'),
      });

    case 'userManagement':
      return Yup.object({
        firstName: Yup.string()
          .required("First name is required"),

        lastName: Yup.string()
          .required("Last name is required"),

        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),

        phoneNumber: Yup.string()
          .required("Phone number is required"),

        age: Yup.number()
          .required("Age is required")
          .min(1, "Age must be at least 1")
          .max(120, "Age must be at most 120"),
      });

    case 'recovery_question':
      return Yup.object({
        question: Yup.string()
          .required("Question is required")
          .min(5, "Question must be at least 5 characters")
          .max(200, "Question must be at most 200 characters"),
      });

    case 'otp_verification':
      return Yup.object().shape({
        otp: Yup.string()
          .required('OTP is required')
          .matches(/^\d{4}$/, 'Enter a valid 4-digit OTP'),
      });

    case 'create_new_password':
      return Yup.object().shape({
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirm_password: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords must match')
          .required('Confirm Password is required'),
      });

    case 'profile_info':
      return Yup.object().shape({
        industry: Yup.string().trim().required('Industry/Service is required'),
        job_title: Yup.string().trim().required('Job Title is required'),
        business_name: Yup.string()
          .trim()
          .required('Business Name is required'),
        business_address: Yup.string()
          .trim()
          .required('Business Address is required'),
        website: Yup.string().nullable(),
        company_description: Yup.string()
          .trim()
          .required('Company Description is required'),
        mission_statement: Yup.string()
          .trim()
          .required('Vision Statement is required'),
      });

    case 'forgot_password':
      return Yup.object().shape({
        email: Yup.string()
          .transform(value => value.trim())
          .matches(emailRegex, 'Invalid email format')
          .required('Email is required'),
      });

    case 'update_phone':
      return Yup.object().shape({
        phone: Yup.string().required('Phone number is required'),
      });

    case 'change_password':
      return Yup.object().shape({
        current_password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        new_password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirm_password: Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords must match')
          .required('Confirm Password is required'),
      });

    case 'update_email':
      return Yup.object().shape({
        email: Yup.string()
          .transform(value => value.trim()) // Apply trim during validation
          .matches(emailRegex, 'Invalid email format')
          .required('Email is required'),
      });

    case 'user_profile_detail':
      return Yup.object().shape({
        name: Yup.string()
          .required('Display name is required')
          .min(2, 'Name must be at least 2 characters')
          .max(50, 'Name must be less than 50 characters')
          .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),

        date_of_birth: Yup.string()
          .required('Date of birth is required')
          .test('age', 'You must be at least 18 years old', function (value) {
            if (!value) return false;
            const today = new Date();
            const birthDate = new Date(value);
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              return age - 1 >= 18;
            }
            return age >= 18;
          }),

        gender: Yup.string()
          .required('Gender identity is required'),

        type: Yup.array()
          .min(1, 'Please select at least one option')
          .required('Please select what you are looking for'),

        bio: Yup.string()
          .required('Bio is required')
          .min(10, 'Bio must be at least 10 characters')
          .max(500, 'Bio must be less than 500 characters'),
      });

    // NEW: Driver Rating Validation Schema
    case 'who_are_you_hoping_to_meet':
      return Yup.object().shape({
        preferred_gender: Yup.array()
          .min(1, 'Please select at least one preferred gender')
          .required('Preferred gender is required'),

        preferred_age_min: Yup.number()
          .min(18, 'Minimum age must be at least 18')
          .max(65, 'Minimum age cannot exceed 65')
          .required('Minimum age is required')
          .test('min-less-than-max', 'Minimum age must be less than maximum age', function (value) {
            const { preferred_age_max } = this.parent;
            return value < preferred_age_max;
          }),

        preferred_age_max: Yup.number()
          .min(18, 'Maximum age must be at least 18')
          .max(65, 'Maximum age cannot exceed 65')
          .required('Maximum age is required')
          .test('max-greater-than-min', 'Maximum age must be greater than minimum age', function (value) {
            const { preferred_age_min } = this.parent;
            return value > preferred_age_min;
          }),

        distance_range: Yup.number()
          .min(0, 'Distance cannot be negative')
          .max(100, 'Distance cannot exceed 100 miles')
          .required('Distance range is required'),

        interests: Yup.array()
          .min(1, 'Please select at least one interest')
          .max(8, 'You can select maximum 8 interests')
          .required('Interests are required'),
      });

    // NEW: Driver Rating Validation Schema
    case 'discover_match_style':
      return Yup.object().shape({
        recharge_activity: Yup.array()
          .min(1, 'Please select how you recharge')
          .required('This field is required'),

        weekend_activity: Yup.array()
          .min(1, 'Please select your ideal weekend activity')
          .required('This field is required'),

        partner_qualities: Yup.array()
          .min(1, 'Please select the most important quality')
          .required('This field is required'),

        long_day_recharge: Yup.array()
          .min(1, 'Please select how you recharge')
          .required('This field is required'),

        long_day_recharge_2: Yup.array()
          .min(1, 'Please select how you recharge')
          .required('This field is required'),
      });

    case 'choose_avatar':
      return Yup.object().shape({
        selected_avatar: Yup.string().required(
          'Please select an avatar to represent yourself',
        ),
      });

    case 'update_user_profile':
      return Yup.object().shape({
        name: Yup.string()
          .required('Full name is required')
          .min(2, 'Name must be at least 2 characters')
          .max(50, 'Name must be less than 50 characters')
          .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

        email: Yup.string()
          .email('Please enter a valid email address')
          .required('Email is required')
          .lowercase(),

        phone: Yup.string()
          .required('Phone number is required')
          .min(10, 'Phone number must be at least 10 digits')
          .matches(
            /^[\+]?[1-9][\d]{0,15}$/,
            'Please enter a valid phone number',
          ),

        location: Yup.string()
          .required('Location is required')
          .min(5, 'Location must be at least 5 characters'),

        dateOfBirth: Yup.string()
          .required('Date of birth is required')
          .test('age', 'You must be at least 18 years old', function (value) {
            if (!value) return false;
            const today = new Date();
            const birthDate = new Date(value);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              age--;
            }

            return age >= 18;
          }),

        gender: Yup.string()
          .required('Gender is required')
          .oneOf(
            ['Male', 'Female', 'Other', 'Non-binary'],
            'Please select a valid gender',
          ),

        bio: Yup.string()
          .required('Bio is required')
          .min(10, 'Bio must be at least 10 characters')
          .max(500, 'Bio must be less than 500 characters'),

        lookingFor: Yup.array()
          .min(1, 'Please select at least one option')
          .max(5, 'You can select maximum 5 options')
          .required('Looking for is required'),

        interests: Yup.array()
          .min(1, 'Please select at least one interest')
          .max(10, 'You can select maximum 10 interests')
          .required('Interests are required'),

        photos: Yup.array()
          .min(1, 'Please upload at least one photo')
          .max(6, 'You can upload maximum 6 photos'),
      });

    default:
      return Yup.object();
  }
};
