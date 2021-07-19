export default {
    "backendUrl": process.env.NODE_ENV === 'development' ? "http://localhost:4000": "http://ec2-52-66-160-163.ap-south-1.compute.amazonaws.com"
}