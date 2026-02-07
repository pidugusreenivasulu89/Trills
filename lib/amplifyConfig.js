import { Amplify } from 'aws-amplify';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: 'ap-south-1_h6mB1WYpq',
            userPoolClientId: '67vgufmpv91kj044eirorp87qq',
            loginWith: {
                oauth: {
                    domain: 'trills-auth.auth.ap-south-1.amazoncognito.com',
                    scopes: ['openid', 'email', 'profile'],
                    redirectSignIn: ['https://www.trills.in'],
                    redirectSignOut: ['https://www.trills.in'],
                    responseType: 'code'
                }
            }
        }
    }
}, { ssr: true });
