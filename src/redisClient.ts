import Redis from 'ioredis';

const redisData = new Redis({

    host: 'redis-18191.c305.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 18191,
    password: '6L0HvXyE5nmeTjji4AeCLc2kib8mbJFz',
    lazyConnect: true
});
redisData.connect().then(() => {
    // logger.info("connected to the redis server");
    console.log("connected to the redis server")
}).catch((err) => console.log(err)
);
export default redisData;
