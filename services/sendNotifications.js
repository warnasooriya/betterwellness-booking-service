const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // Example: 'us-east-1'
  
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

const sendBookingConfirmationEmail = async (toEmail,htmlData) => {
    
  const params = {
    Source: process.env.SES_EMAIL, // Must be a verified email in AWS SES
    Destination: {
      ToAddresses: [toEmail], 
    },
    Message: {
      Subject: {
        Data: "Booking Confirmation - Your Booking Details",
      },
      Body: {
        Html: {
          Data:  htmlData
        },
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log("Email sent successfully!", result);
    // return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// export the function
module.exports = {sendBookingConfirmationEmail} ;