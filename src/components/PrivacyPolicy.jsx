import React from 'react';
import { Box, Container, Typography, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Logo from '../assets/images/NewzTok logo-2.svg';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        py: 4
      }}>
        {/* Back button */}
        <Box sx={{ alignSelf: 'flex-start', mb: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ color: 'text.primary' }}
          >
            Back
          </Button>
        </Box>

        {/* Logo */}
        <Box 
          component="img" 
          src={Logo} 
          alt="Newztok Logo" 
          sx={{ 
            height: 80, 
            mb: 4 
          }} 
        />

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" textAlign="center">
          Privacy Policy
        </Typography>
        
        <Divider sx={{ width: '100%', mb: 4 }} />

        <Box sx={{ width: '100%', mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            1. GENERAL
          </Typography>
          <Typography paragraph>
            1.1 Newztok Media Solutions Pvt. Ltd. ("Newztok", "We", "Our", "Us") is committed to the responsible collection, usage, and protection of your personal data in accordance with the Digital Personal Data Protection (DPDP) Act, 2023.
          </Typography>
          <Typography paragraph>
            1.2 By accessing or using the Newztok application ("App") or website ("Platform"), you ("User", "You", "Your") consent to the collection, processing, storage, and usage of your personal data as outlined in this Privacy Policy.
          </Typography>
          <Typography paragraph>
            1.3 This Privacy Policy applies to all Users, including general users, editors, and journalists, and should be read in conjunction with our Terms & Conditions. By continuing to use the platform, you confirm your agreement to this policy.
          </Typography>
          <Typography paragraph>
            1.4 Any undefined terms in this Privacy Policy will have the same meaning as defined in the Terms & Conditions.
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            2. INFORMATION WE COLLECT
          </Typography>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2.1 Traffic Data (Non-Personal Information)
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li>IP address</li>
              <li>Device identifiers</li>
              <li>Browser type and version</li>
              <li>Time and date of your visits</li>
              <li>Interaction data with the App (usage behaviour, logs)</li>
              <li>Device location and operating system</li>
            </ul>
            This data helps us improve app performance, user experience, and security.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            2.2 Personal Data
          </Typography>
          <Typography paragraph>
            To provide specific services, we may collect:
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li><strong>Contact Information:</strong> such as name, email ID, phone number.</li>
              <li><strong>Device Data:</strong> mobile model, OS version, and unique identifiers.</li>
              <li><strong>Demographic Data:</strong> postal address, gender, time zone, language preference.</li>
              <li><strong>User-Generated Content:</strong> content posted or submitted by users, editors, or journalists.</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            3. LAWFUL PURPOSES OF DATA USE
          </Typography>
          <Typography paragraph>
            Under the DPDP Act 2023, we collect and process personal data for lawful purposes, such as:
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li>Operating and improving the Newztok platform</li>
              <li>Verifying identity and maintaining user accounts</li>
              <li>Enabling content submission, editing, and moderation</li>
              <li>Facilitating payments (for verified editors/journalists, where applicable)</li>
              <li>Sending important service updates or notifications</li>
              <li>Protecting our rights and preventing misuse</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            4. CONSENT
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li>Your continued use of the Newztok platform implies your consent to this Privacy Policy.</li>
              <li>You may withdraw consent at any time by contacting us at support@newztok.com, subject to applicable legal obligations.</li>
              <li>In the case of minors, data will only be processed after receiving verifiable consent from a parent or guardian.</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            5. DATA STORAGE AND SECURITY
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li>Personal data is stored on secure servers located in India.</li>
              <li>We implement safeguards to protect your data from unauthorized access, loss, or misuse.</li>
              <li>Access to personal data is limited to authorized personnel.</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            6. DATA RETENTION
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li>We retain your personal data only for as long as necessary or required by law.</li>
              <li>Data related to journalistic or editorial contributions may be retained longer.</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            7. YOUR RIGHTS UNDER DPDP ACT 2023
          </Typography>
          <Typography paragraph>
            As a user, you have the right to:
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li>Access your personal data held by us</li>
              <li>Correct inaccurate or misleading personal data</li>
              <li>Withdraw consent at any time</li>
              <li>Request erasure of your personal data</li>
              <li>Nominate an individual to exercise your rights</li>
            </ul>
            To exercise your rights, contact: support@newztok.com
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            8. DATA SHARING & DISCLOSURE
          </Typography>
          <Typography paragraph>
            We do not disclose your personal data without your consent, except:
          </Typography>
          <Typography component="div" paragraph>
            <ul>
              <li>To comply with laws or legal processes</li>
              <li>To enforce our terms or protect safety</li>
              <li>With verified service providers under strict agreements</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            9. CHANGES TO THIS POLICY
          </Typography>
          <Typography paragraph>
            We may update or modify this Privacy Policy. Continued use of the platform implies your acceptance of changes.
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            10. CONTACT US
          </Typography>
          <Typography paragraph>
            Newztok Media Solutions Pvt. Ltd.<br />
            Email: support@newztok.com<br />
            Address: M/5, Chandi Vyapar Bhawan, Exhibition Road, Chiraiyatand, Patna, Phulwari, Bihar, India, 800001
          </Typography>
        </Box>

        <Box sx={{ width: '100%', textAlign: 'center', mt: 4, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="body2" color="textSecondary">
            © Newztok Media Solutions Pvt. Ltd.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy; 