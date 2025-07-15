import React from 'react';
import { Box, Container, Typography, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Logo from '../assets/images/NewzTok logo-2.svg';

const TermsAndConditions = () => {
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
          Terms and Conditions
        </Typography>
        
        <Divider sx={{ width: '100%', mb: 4 }} />

        <Box sx={{ width: '100%', mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            1. Introduction
          </Typography>
          <Typography paragraph>
            Welcome to Newztok, a digital news aggregation and social media platform powered by Newztok Media Solutions Pvt. Ltd. By using this platform, you agree to be bound by these Terms & Conditions ("Terms"). These Terms apply to all users, including general users, editors, and journalists.
            We operate primarily in India with a focus on content from Bihar, Uttar Pradesh, and Jharkhand.
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            2. Platform Nature and Disclaimer
          </Typography>
          <Typography paragraph>
            Newztok functions as a news aggregator and social engagement platform.
            We provide tools for users to post, view, comment, and share content.
            Newztok is not responsible for the authenticity, accuracy, or legality of any user-generated content including posts, comments, or shared media.
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            3. User-Generated Content
          </Typography>
          <Typography paragraph>
            Users are solely responsible for the content they create, upload, or interact with.
            <br /><br />
            Newztok does not endorse or verify user-submitted content.
            We are not liable for any allegations, legal actions, or disputes arising out of user posts or comments.
            Users must refrain from sharing:
            <ul>
              <li>Hate speech, abusive or defamatory content.</li>
              <li>Misinformation or unverified claims.</li>
              <li>Content that violates copyright or legal boundaries.</li>
            </ul>
            Violation of this section may lead to content removal and account suspension.
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            4. Editor & Journalist Specific Terms
          </Typography>
          <Typography paragraph>
            These terms apply to individuals working as Editors and Journalists on the Newztok platform.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4.1 Responsibilities
          </Typography>
          <Typography paragraph>
            <strong>Editors:</strong>
            <ul>
              <li>Prepare, refine, and submit news content under assigned categories.</li>
              <li>Ensure grammatical accuracy, relevance, and clarity.</li>
              <li>Post only after content is verified by Journalists (unless admin privileges apply).</li>
            </ul>
            <strong>Journalists:</strong>
            <ul>
              <li>Verify the authenticity, sources, and neutrality of submitted content.</li>
              <li>Approve, reject, or suggest changes to content promptly.</li>
              <li>Ensure that news items follow ethical journalism standards.</li>
            </ul>
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4.2 Ownership and Liability
          </Typography>
          <Typography paragraph>
            Editors and Journalists retain authorship of their respective contributions.
            Newztok Media Solutions Pvt. Ltd. acts solely as a publishing platform and is not liable for the content produced by editors or journalists.
            Individuals are personally liable for any legal disputes, fake news, or misinformation published under their name.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4.3 Plagiarism & Misconduct
          </Typography>
          <Typography paragraph>
            Plagiarism or spreading misinformation is strictly prohibited.
            Violation may lead to termination, blacklisting, and possible legal action under applicable laws.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4.4 Compensation & Payment (If Applicable)
          </Typography>
          <Typography paragraph>
            Contributors may be compensated based on performance, approval, or article count as per mutually agreed terms.
            Newztok reserves the right to withhold payment in case of content disputes or violations.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            4.5 Termination
          </Typography>
          <Typography paragraph>
            Newztok may terminate access or association with any editor/journalist without notice for:
            <ul>
              <li>Policy violations.</li>
              <li>Repeated rejection of work.</li>
              <li>Public or legal complaints.</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            5. Copyright
          </Typography>
          <Typography paragraph>
            All platform features, branding, and original design are protected under copyright law.
            © Newztok Media Solutions Pvt. Ltd. All Rights Reserved.
            Unauthorized reproduction, scraping, or duplication of platform content without prior permission is prohibited.
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            6. Third-Party Links and Sources
          </Typography>
          <Typography paragraph>
            Newztok may link to third-party content or sources. We are not responsible for:
            <ul>
              <li>The reliability or accuracy of external content.</li>
              <li>Privacy practices of external websites.</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            7. Limitation of Liability
          </Typography>
          <Typography paragraph>
            Newztok Media Solutions Pvt. Ltd. is not liable for:
            <ul>
              <li>Content submitted by users, editors, or journalists.</li>
              <li>Indirect, incidental, or consequential damages.</li>
              <li>Claims arising out of external sharing or misuse of content.</li>
            </ul>
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            8. Governing Law
          </Typography>
          <Typography paragraph>
            These Terms shall be governed in accordance with Indian laws. Any disputes will fall under the jurisdiction of the courts of Jharkhand, Uttar-Pradesh, Bihar, unless otherwise specified.
          </Typography>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            9. Changes to Terms
          </Typography>
          <Typography paragraph>
            We may update these Terms from time to time. Continued use of the platform implies acceptance of the latest Terms.
          </Typography>
        </Box>

        <Box sx={{ width: '100%', textAlign: 'center', mt: 4, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="body2" color="textSecondary">
            © Newztok Media Solutions Pvt. Ltd. All Rights Reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default TermsAndConditions; 