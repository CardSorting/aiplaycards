'use client';

import { Box, Container, Divider, Paper, Typography } from '@mui/material';

export default function TermsOfServicePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Terms of Service
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
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" paragraph>
              By accessing and using our Pokémon card creation service, you
              accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do
              not use this service.
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
              2. Description of Service
            </Typography>
            <Typography variant="body1" paragraph>
              Our service provides a platform for creating custom Pokémon-style
              trading cards. Users can:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Create custom trading cards with AI-generated artwork
              <br />
              • Save cards to personal galleries
              <br />
              • Buy and sell cards on our marketplace
              <br />
              • Purchase credits for premium features
              <br />• Open booster packs for random card generation
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
              3. User Accounts and Registration
            </Typography>
            <Typography variant="body1" paragraph>
              To use our service, you must:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Be at least 13 years of age
              <br />
              • Provide accurate and complete registration information
              <br />
              • Maintain the security of your account credentials
              <br />
              • Accept responsibility for all activities under your account
              <br />• Notify us immediately of any unauthorized use of your
              account
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
              4. Intellectual Property and Content
            </Typography>
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              fontWeight={500}
              sx={{ fontSize: '1.1rem', mt: 2 }}
            >
              4.1 Your Content
            </Typography>
            <Typography variant="body1" paragraph>
              You retain ownership of the original content you create. However,
              by using our service, you grant us a non-exclusive, worldwide,
              royalty-free license to use, display, and distribute your content
              as necessary to provide our services.
            </Typography>

            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              fontWeight={500}
              sx={{ fontSize: '1.1rem', mt: 2 }}
            >
              4.2 Platform Content
            </Typography>
            <Typography variant="body1" paragraph>
              Our service, including its design, features, and underlying
              technology, is owned by us and protected by intellectual property
              laws. You may not copy, modify, or distribute our platform content
              without permission.
            </Typography>

            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              fontWeight={500}
              sx={{ fontSize: '1.1rem', mt: 2 }}
            >
              4.3 Pokémon Intellectual Property
            </Typography>
            <Typography variant="body1" paragraph>
              Pokémon characters, names, and related intellectual property are
              owned by The Pokémon Company, Nintendo, and Game Freak. Our
              service is a fan-made tool for creating custom cards and is not
              affiliated with or endorsed by these companies. Users create cards
              for personal enjoyment and community sharing.
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
              5. Prohibited Uses
            </Typography>
            <Typography variant="body1" paragraph>
              You agree not to use our service to:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Create content that is illegal, harmful, or infringes on others'
              rights
              <br />
              • Attempt to gain unauthorized access to our systems
              <br />
              • Interfere with or disrupt the service or servers
              <br />
              • Use automated systems to access the service excessively
              <br />
              • Create multiple accounts to circumvent limitations
              <br />
              • Engage in fraudulent payment activities
              <br />
              • Harass, abuse, or harm other users
              <br />• Create content that violates community standards
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
              6. Marketplace and Payments
            </Typography>
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              fontWeight={500}
              sx={{ fontSize: '1.1rem', mt: 2 }}
            >
              6.1 Credits and Purchases
            </Typography>
            <Typography variant="body1" paragraph>
              • Credits purchased are non-refundable except as required by law
              <br />
              • Credits have no cash value and cannot be transferred between
              accounts
              <br />• We reserve the right to modify credit pricing and features
            </Typography>

            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              fontWeight={500}
              sx={{ fontSize: '1.1rem', mt: 2 }}
            >
              6.2 Marketplace Transactions
            </Typography>
            <Typography variant="body1" paragraph>
              • Users can buy and sell cards through our marketplace
              <br />
              • We may charge transaction fees on marketplace sales
              <br />
              • Sellers are responsible for accurate card descriptions
              <br />• All sales are final unless otherwise specified
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
              7. Privacy and Data Protection
            </Typography>
            <Typography variant="body1" paragraph>
              Your privacy is important to us. Please review our Privacy Policy
              to understand how we collect, use, and protect your information.
              By using our service, you consent to our data practices as
              described in the Privacy Policy.
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
              8. Service Availability and Modifications
            </Typography>
            <Typography variant="body1" paragraph>
              We strive to provide reliable service, but we do not guarantee
              uninterrupted access. We reserve the right to:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Modify or discontinue features at any time
              <br />
              • Perform maintenance that may temporarily limit access
              <br />
              • Update these terms as our service evolves
              <br />• Suspend or terminate accounts that violate these terms
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
              9. Disclaimers and Limitation of Liability
            </Typography>
            <Typography variant="body1" paragraph>
              Our service is provided "as is" without warranties of any kind. We
              are not liable for:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Loss of data or content
              <br />
              • Service interruptions or downtime
              <br />
              • Actions of other users
              <br />
              • Issues with third-party payment processors
              <br />• Indirect, incidental, or consequential damages
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
              10. Account Termination
            </Typography>
            <Typography variant="body1" paragraph>
              You may delete your account at any time. We may suspend or
              terminate accounts that:
            </Typography>
            <Typography variant="body1" component="div" sx={{ ml: 2 }}>
              • Violate these terms of service
              <br />
              • Engage in fraudulent or harmful activities
              <br />
              • Remain inactive for extended periods
              <br />• Are involved in payment disputes
            </Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              Upon termination, you lose access to your account and associated
              content, though we may retain certain data as required by law or
              for legitimate business purposes.
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
              11. Dispute Resolution
            </Typography>
            <Typography variant="body1" paragraph>
              Any disputes arising from your use of our service will be resolved
              through good faith negotiation. If that fails, disputes may be
              subject to binding arbitration or the jurisdiction of courts in
              our operating location.
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
              12. Changes to Terms
            </Typography>
            <Typography variant="body1" paragraph>
              We may update these terms periodically to reflect changes in our
              service or legal requirements. Material changes will be
              communicated through our platform or via email. Continued use of
              our service after changes constitutes acceptance of the updated
              terms.
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
              13. Contact Information
            </Typography>
            <Typography variant="body1" paragraph>
              If you have questions about these terms or need to report
              violations, please contact us through our support channels or
              using the contact information provided on our website.
            </Typography>
          </section>
        </Box>
      </Paper>
    </Container>
  );
}
