import { Box, styled, Typography } from '@mui/material';

const Banner = styled(Box)`
    background-image: url('https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
    width: 100%;
    height: 50vh;
    background-position: center;
    background-size: cover;
`;


const Wrapper = styled(Box)`
    padding: 20px;
    & > h3, & > h5 {
        margin-top: 50px;
    }
`;

const Text = styled(Typography)`
    color: #878787;
`;

const About = () => {
    return (
        <Box>
            <Banner/>
            <Wrapper>
                <Typography variant="h3">PatientZero</Typography>
                <Text variant="h5">
                    Welcome to PatientZero, a collaborative platform designed to empower patients and healthcare professionals. This app allows patients to share health stories, connect with others on their recovery journeys, and access valuable information from medical experts.<br />
                    Dive into our community-driven content and join conversations that bring meaningful support to health experiences.
                </Text>
            </Wrapper>
        </Box>
    )
}

export default About;
