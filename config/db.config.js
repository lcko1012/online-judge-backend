module.exports = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "12345678",
    DB: "onlinejudge",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}

// Define the heroku database connection
// module.exports = {
//     USER: "gipixpirrofvgs",
//     PASSWORD: "cc84c88b415a0397723c67a0736cd56a66c2a850af4302bf0d6840f6c8ba24fd",
//     DB: "postgres://gipixpirrofvgs:cc84c88b415a0397723c67a0736cd56a66c2a850af4302bf0d6840f6c8ba24fd@ec2-35-168-65-132.compute-1.amazonaws.com:5432/d9tu79cunj6o37",
//     dialect: "postgres",
//     dialectOptions: {
//         ssl: {
//             require: true,
//             rejectUnauthorized: false
//         }
//     }, 
//     protocol: 'postgres',
// }