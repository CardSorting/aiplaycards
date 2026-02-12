'use client';

import { Box, Container, Divider, Paper, Typography } from '@mui/material';

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Privacy Policy
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ '& > *': { mb: 3 } }}>
          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              1. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              When you use our Pokémon card creator service, we collect the
              following information:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • <strong>Account Information:</strong> When you create an
              account, we collect your name, email address, and password (stored
              securely using bcrypt hashing)
              <br />• <strong>Created Content:</strong> Pokémon cards you
              create, including images, text, and card configurations
              <br />• <strong>Usage Data:</strong> Information about how you use
              our service, including cards created, marketplace activity, and
              feature usage
              <br />• <strong>Technical Data:</strong> IP address, browser type,
              device information, and session data for security and performance
              purposes
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use your information to:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Provide and maintain our card creation service
              <br />
              • Authenticate your account and manage your session
              <br />
              • Store and display your created cards in your gallery
              <br />
              • Enable marketplace features for buying and selling cards
              <br />
              • Process payments and manage credits
              <br />
              • Send notifications about your account and activity
              <br />
              • Improve our service and develop new features
              <br />• Ensure security and prevent fraud
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              3. Information Sharing
            </Typography>
            <Typography variant="body1" paragraph>
              We do not sell your personal information. We may share your
              information in the following limited circumstances:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • <strong>Public Content:</strong> Cards you choose to make public
              or list on the marketplace are visible to other users
              <br />• <strong>Service Providers:</strong> With trusted third
              parties who help us operate our service (payment processors,
              hosting providers)
              <br />• <strong>Legal Requirements:</strong> When required by law
              or to protect our rights and users' safety
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              4. Data Storage and Security
            </Typography>
            <Typography variant="body1" paragraph>
              We implement appropriate security measures to protect your
              information:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Data is stored securely using industry-standard encryption
              <br />
              • Access to personal information is limited to authorized
              personnel
              <br />
              • We regularly review and update our security practices
              <br />• Payment information is processed by secure third-party
              providers (PayPal)
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              5. Your Rights and Choices
            </Typography>
            <Typography variant="body1" paragraph>
              You have the following rights regarding your personal information:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • <strong>Access:</strong> View and download your personal data
              <br />• <strong>Correction:</strong> Update or correct your
              account information
              <br />• <strong>Deletion:</strong> Request deletion of your
              account and associated data
              <br />• <strong>Data Portability:</strong> Export your created
              cards and data
              <br />• <strong>Opt-out:</strong> Unsubscribe from non-essential
              communications
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              6. Third-Party Services
            </Typography>
            <Typography variant="body1" paragraph>
              Our service integrates with the following third-party providers:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • <strong>PayPal:</strong> For payment processing and credit
              purchases
              <br />• <strong>AI Image Services:</strong> For generating Pokémon
              card artwork
              <br />• <strong>Cloud Storage:</strong> For storing card images
              and user content
            </Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              Each of these services has their own privacy policies that govern
              how they handle your data.
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              7. Cookies and Tracking
            </Typography>
            <Typography variant="body1" paragraph>
              We use cookies and similar technologies to:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Maintain your login session
              <br />
              • Remember your preferences and settings
              <br />
              • Analyze usage patterns to improve our service
              <br />• Ensure security and prevent fraud
            </Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              You can control cookies through your browser settings, but some
              features may not work properly if cookies are disabled.
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              8. Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Our service is intended for users 13 years of age and older. We do
              not knowingly collect personal information from children under 13.
              If we become aware that we have collected personal information
              from a child under 13, we will delete that information promptly.
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              9. Changes to This Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this privacy policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the "Last updated" date. Your continued use
              of our service after any changes indicates your acceptance of the
              updated policy.
            </Typography>
          </section>

          <Divider />

          <section>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              fontWeight={600}
            >
              10. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about this privacy policy or how we
              handle your personal information, please contact us through our
              support channels or by using the contact information provided on
              our website.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
}
