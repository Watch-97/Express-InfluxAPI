const dotenv = require('dotenv')
dotenv.config({path: '.env-local'})

const Influx = require('influx');

const influx = new Influx.InfluxDB({
  host: process.env.INFLUXDB_HOST,
  database: process.env.INFLUXDB_DATABASE,
  username: process.env.INFLUXDB_USER,
  password: process.env.INFLUXDB_PASSWORD,
});

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes(process.env.INFLUXDB_DATABASE)) {
      return influx.createDatabase(process.env.INFLUXDB_DATABASE);
    }
  })
  .then(() => console.log(`Connected to InfluxDB database: ${process.env.INFLUXDB_DATABASE}`))
  .catch(err => console.error('Error connecting to InfluxDB:', err));

module.exports = influx;
