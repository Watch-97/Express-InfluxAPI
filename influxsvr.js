  // Import Express module
  const express = require('express');
  const Influx = require('influx');
  
  
  // Import the database module
 // const influx = require('./helpers/database');
  
  
  /*// Database
  const dotenv = require('dotenv')
  dotenv.config({path: '.env-local'})
  */
  // Create Express application
  const app = express();
  
  
  // Set up InfluxDB connection
  const influx = new Influx.InfluxDB({
      host: 'localhost',
      database: 'solar_mock',
      username: 'apiadmin', // ระบุชื่อผู้ใช้งานของคุณที่มีสิทธิ์ในการเข้าถึง InfluxDB
      password: 'Admin123', // ระบุรหัสผ่านของผู้ใช้งานของคุณ
    });
  
  // Middleware to parse JSON requests
  app.use(express.json());
  
  // Define common function to handle InfluxDB queries
  function handleInfluxDBQuery(req, res, query) {
      influx.query(query)
        .then(result => {
          res.json(result); // Send query result as JSON response
        })
        .catch(err => {
          console.error('Error executing InfluxDB query:', err);
          res.status(500).json({ error: 'Internal server error' });
        });
    }

// ALL DATA in specific Device
    app.post('/device/data', (req, res) => {
      // Retrieve query parameters from request
      const {device } = req.body;
    
      // Construct InfluxDB query based on parameters
      const query = `SELECT * FROM realtimedata WHERE Device = '${device}' LIMIT 5`;
    
      // Execute the query against InfluxDB
      handleInfluxDBQuery(req, res, query);
    });
 
 
// ALL DATA in specific Device
app.post('/device/setting', (req, res) => {
    // Retrieve query parameters from request
    const {device } = req.body;
  
    // Construct InfluxDB query based on parameters
    const query = `SELECT * FROM SettingParameter WHERE Device = '${device}' LIMIT 5`;
  
    // Execute the query against InfluxDB
    handleInfluxDBQuery(req, res, query);
  });
  



// Specific DATA in specific Device
app.post('/data/select', (req, res) => {
  // Retrieve query parameters from request
  const { data, device } = req.body;

  // Check if the data parameter contains '*'
  if (data.includes('*')) {
    return res.status(400).json({ error: "The 'data' parameter cannot contain '*'" });
  }

  // Construct InfluxDB query based on parameters
  const query = `SELECT ${data} FROM realtimedata WHERE Device = '${device}'`;

  // Execute the query against InfluxDB
  handleInfluxDBQuery(req, res, query);
});


  /*
    // Define route for querying device data
    app.post('/query/device', (req, res) => {
      // Retrieve query parameters from request
      const { measurement } = req.body;
    
      // Construct InfluxDB query based on parameters
      const query = `SELECT DISTINCT(Device) FROM ${measurement} LIMIT 10`;
    
      // Execute the query against InfluxDB
      handleInfluxDBQuery(req, res, query);
    });
  */
  /*
  app.get('/devices', (req, res) => {
    // Query to retrieve unique device values
    const query = 'SHOW TAG VALUES WITH KEY = "Device"';
  
    influx.query(query)
        .then(result => {
            // Extract device values
            const deviceSet = new Set(result.map(entry => entry.value));
            const uniqueDevices = Array.from(deviceSet); // Convert Set back to Array
            
            res.json(uniqueDevices); // Send the array of unique device values as JSON response
        })
        .catch(err => {
            console.error('Error querying InfluxDB:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
  });
  */
  app.get('/devices', (req, res) => {
    // Query to retrieve unique device values
    const query = 'SHOW TAG VALUES WITH KEY = "Device"';
  
    influx.query(query)
        .then(result => {
            const uniqueDevices = []; // เก็บอุปกรณ์ที่ไม่ซ้ำ
  
            // ลูปผ่านผลลัพธ์และเพิ่มอุปกรณ์ที่ไม่ซ้ำลงในอาร์เรย์ uniqueDevices
            result.forEach((entry, index) => {
                if (!uniqueDevices.includes(entry.value)) {
                    uniqueDevices.push(entry.value);
                }
            });
  
            // สร้าง Object สำหรับการส่ง response พร้อมจำนวนอุปกรณ์
            const response = uniqueDevices.map((device, index) => ({ Index: index + 1, Device: device }));
            const deviceCount = uniqueDevices.length; // นับจำนวนอุปกรณ์
  
            res.json({ deviceCount, devices: response }); // ส่งค่าเป็น JSON response พร้อมจำนวนอุปกรณ์
        })
        .catch(err => {
            console.error('Error querying InfluxDB:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
  });
  
  
  /*
  // Route รายการอุปกรณ์ + Index
  app.get('/devices', (req, res) => {
      // Query to retrieve unique device values
      const query = 'SHOW TAG VALUES WITH KEY = "Device"';
  
      influx.query(query)
          .then(result => {
              // Extract device values and add index to each device
              const devices = result.map((entry, index) => ({ Device: index + 1, Device_name: entry.value }));
              res.json(devices); // Send the array of device values with index as JSON response
          })
          .catch(err => {
              console.error('Error querying InfluxDB:', err);
              res.status(500).json({ error: 'Internal server error' });
          });
  });
  */
  
  // Route รายชื่อจังหวัด + Index
  app.get('/provinces', (req, res) => {
    // Query to retrieve unique province values
    const query = 'SHOW TAG VALUES WITH KEY = "Location"';
  
    influx.query(query)
        .then(result => {
            // Map the result to include index for each province
            const provinces = result.map((entry, index) => {
                return { index: index + 1, province: entry.value };
            });
  
            res.json(provinces); // Send the array of provinces with index as JSON response
        })
        .catch(err => {
            console.error('Error querying InfluxDB:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
  });
  

// สร้าง endpoint สำหรับดึงข้อมูล Location สำหรับแต่ละ Region
app.get('/regions', (req, res) => {
    let regions = ['Central', 'Isan', 'Northen', 'Southern'];

    // ตรวจสอบว่ามี query parameter region หรือไม่ ถ้ามีให้ใช้ region ที่ระบุ
    if (req.query.region) {
        regions = [req.query.region];
    }

    const promises = regions.map(region => {
        const query = `SHOW TAG VALUES WITH KEY = "Location" WHERE "Region" = '${region}'`;
        return influx.query(query)
            .then(result => ({
                region: region,
                locations: result.map(entry => entry.value)
            }))
            .catch(error => ({
                region: region,
                error: error.message
            }));
    });

    Promise.all(promises)
        .then(data => {
            // ลบข้อมูลที่ซ้ำออกจาก locations สำหรับแต่ละ region
            data.forEach(regionData => {
                regionData.locations = [...new Set(regionData.locations)];
            });

            // ส่งข้อมูลกลับเป็น JSON response
            res.json(data);
        })
        .catch(error => res.status(500).json({ error: error.message }));
});


app.get('/regions/device', (req, res) => {
    let regions = ['Central', 'Isan', 'Northen', 'Southern'];

    // ตรวจสอบว่ามี query parameter region หรือไม่ ถ้ามีให้ใช้ region ที่ระบุ
    if (req.query.region) {
        regions = [req.query.region];
    }

    const promises = regions.map(region => {
        const query = `SHOW TAG VALUES WITH KEY = "Location" WHERE "Region" = '${region}'`;
        return influx.query(query)
            .then(result => {
                const locationsPromises = result.map(entry => {
                    const location = entry.value;
                    const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device" WHERE "Location" = '${location}'`;
                    return influx.query(deviceQuery)
                        .then(deviceResult => ({
                            location: location,
                            devices: deviceResult.map(deviceEntry => deviceEntry.value)
                        }))
                        .catch(error => ({
                            location: location,
                            error: error.message
                        }));
                });

                return Promise.all(locationsPromises)
                    .then(locationsData => ({
                        region: region,
                        locations: locationsData
                    }))
                    .catch(error => ({
                        region: region,
                        error: error.message
                    }));
            })
            .catch(error => ({
                region: region,
                error: error.message
            }));
    });

    Promise.all(promises)
        .then(data => {
            res.json(data);
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

app.get('/regions/device/detail', (req, res) => {
    let regions = ['Central', 'Isan', 'Northen', 'Southern'];

    // ตรวจสอบว่ามี query parameter region หรือไม่ ถ้ามีให้ใช้ region ที่ระบุ
    if (req.query.region) {
        regions = [req.query.region];
    }

    const promises = regions.map(region => {
        const query = `SHOW TAG VALUES WITH KEY = "Location" WHERE "Region" = '${region}'`;
        return influx.query(query)
            .then(result => {
                const locationsPromises = result.map(entry => {
                    const location = entry.value;
                    const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device" WHERE "Location" = '${location}'`;
                    return influx.query(deviceQuery)
                        .then(deviceResult => {
                            const uniqueDevices = [...new Set(deviceResult.map(deviceEntry => deviceEntry.value))]; // แปลงให้เป็น Set เพื่อลบค่าที่ซ้ำกัน
                            const deviceDataPromises = uniqueDevices.map(device => {
                                // สร้าง query สำหรับดึงรายละเอียดเพิ่มเติมของแต่ละอุปกรณ์
                                const detailQuery = `SELECT * FROM realtimedata WHERE "Device" = '${device}' LIMIT 1`;
                                return influx.query(detailQuery)
                                    .then(detailResult => ({
                                        device: device,
                                        details: detailResult
                                    }))
                                    .catch(error => ({
                                        device: device,
                                        error: error.message
                                    }));
                            });

                            return Promise.all(deviceDataPromises)
                                .then(deviceData => ({
                                    location: location,
                                    devices: deviceData
                                }))
                                .catch(error => ({
                                    location: location,
                                    error: error.message
                                }));
                        })
                        .catch(error => ({
                            location: location,
                            error: error.message
                        }));
                });

                return Promise.all(locationsPromises)
                    .then(locationsData => ({
                        region: region,
                        locations: locationsData
                    }))
                    .catch(error => ({
                        region: region,
                        error: error.message
                    }));
            })
            .catch(error => ({
                region: region,
                error: error.message
            }));
    });

    Promise.all(promises)
        .then(data => {
            res.json(data);
        })
        .catch(error => res.status(500).json({ error: error.message }));
});


  /*
  app.get('/search/device', (req, res) => {
    // Query to retrieve unique device values based on Tag Key "Location"
    const query = 'SHOW TAG VALUES WITH KEY = "Location"';
   
     // ระบุฐานข้อมูลในการคิวรีด้วยคุณสมบัติ database
     influx.query(query)
     .then(result => {
         const uniqueProvinces = result.map(entry => entry.value);

         // Now, let's query unique devices for each province
         const devicesPromises = uniqueProvinces.map(province => {
             const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device" WHERE "Location" = '${province}'`;
             return influx.query(deviceQuery)
                 .then(deviceResult => ({
                     province: province,
                     devices: deviceResult.map(deviceEntry => deviceEntry.value)
                 }))
                 .catch(error => {
                     console.error(`Error querying devices for ${province}:`, error);
                     return { province: province, devices: [] };
                 });
         });

         // Wait for all queries to complete
         Promise.all(devicesPromises)
             .then(devicesByProvince => {
                 res.json(devicesByProvince); // Send the array of devices by province as JSON response
             })
             .catch(err => {
                 console.error('Error querying InfluxDB:', err);
                 res.status(500).json({ error: 'Internal server error' });
             });
     })
     .catch(err => {
         console.error('Error querying InfluxDB:', err);
         res.status(500).json({ error: 'Internal server error' });
     });
}); 
 */ 
 
//รายการอุปกรณ์ในแต่ละจังหวัด
app.get('/search/device', (req, res) => {
    // Query to retrieve unique device values based on Tag Key "Location"
    const query = 'SHOW TAG VALUES WITH KEY = "Location"';
   
    // ระบุฐานข้อมูลในการคิวรีด้วยคุณสมบัติ database
    influx.query(query)
    .then(result => {
        const uniqueProvinces = result.map(entry => entry.value);

        // Now, let's query unique devices for each province
        const devicesPromises = uniqueProvinces.map(province => {
            const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device" WHERE "Location" = '${province}'`;
            return influx.query(deviceQuery)
                .then(deviceResult => ({
                    province: province,
                    devices: [...new Set(deviceResult.map(deviceEntry => deviceEntry.value))]
                }))
                .catch(error => {
                    console.error(`Error querying devices for ${province}:`, error);
                    return { province: province, devices: [] };
                });
        });

        // Wait for all queries to complete
        Promise.all(devicesPromises)
            .then(devicesByProvince => {
                res.json(devicesByProvince); // Send the array of devices by province as JSON response
            })
            .catch(err => {
                console.error('Error querying InfluxDB:', err);
                res.status(500).json({ error: 'Internal server error' });
            });
    })
    .catch(err => {
        console.error('Error querying InfluxDB:', err);
        res.status(500).json({ error: 'Internal server error' });
    });
});

 //สามารถระบุชื่อ Location ผ่าน request parameter และค้นหา devices สำหรับ Location ที่ระบุ
 app.get('/search/device/province', (req, res) => {
    const { location } = req.query; // รับชื่อ Location จาก request param

    if (!location) {
        return res.status(400).json({ error: 'Location parameter is required' });
    }

    // Query to retrieve unique device values based on the specified Location
    const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device" WHERE "Location" = '${location}'`;

    influx.query(deviceQuery)
        .then(deviceResult => {
            // ใช้ Set เพื่อกรอง devices ที่ไม่ซ้ำกัน
            const uniqueDevices = new Set(deviceResult.map(deviceEntry => deviceEntry.value));
            // แปลง Set เป็น array
            const devices = [...uniqueDevices];

            res.json({ location: location, devices: devices });
        })
        .catch(error => {
            console.error(`Error querying devices for ${location}:`, error);
            res.status(500).json({ error: 'Internal server error' });
        });
});


// สามารถระบุชื่อ Location ผ่าน request parameter และค้นหา devices สำหรับ Location ที่ระบุ
app.get('/search/device/province/detail', (req, res) => {
    const { location } = req.query; // รับชื่อ Location จาก request param

    if (!location) {
        return res.status(400).json({ error: 'Location parameter is required' });
    }

    // Query to retrieve unique device values based on the specified Location
    const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device" WHERE "Location" = '${location}'`;

    influx.query(deviceQuery)
        .then(deviceResult => {
            // ใช้ Set เพื่อกรอง devices ที่ไม่ซ้ำกัน
            const uniqueDevices = new Set(deviceResult.map(deviceEntry => deviceEntry.value));
            // แปลง Set เป็น array
            const devices = [...uniqueDevices];

            // เพิ่มการค้นหาข้อมูลทั้งหมดจากทุกอุปกรณ์ (Device) เฉพาะ Location ที่ระบุ
            const promises = devices.map(device => {
                const query = `SELECT TotalPowerGen,MPPTBatteryVoltage,DCOutputStatus,ChargingStatus, InTemp FROM realtimedata WHERE "Location" = '${location}' AND "Device" = '${device}' LIMIT 1`;
                return influx.query(query);
            });

            // รอให้ทุกคำสั่งคิวรีเสร็จสิ้นและรวมผลลัพธ์
            Promise.all(promises)
                .then(results => {
                    // สร้างอาเรย์ของผลลัพธ์ที่ได้จากการค้นหาข้อมูลทั้งหมดของทุกอุปกรณ์
                    const allData = results.map((result, index) => ({
                        device: devices[index],
                        data: result
                    }));
                    res.json({ location: location, allData: allData });
                })
                .catch(error => {
                    console.error(`Error querying all data for ${location}:`, error);
                    res.status(500).json({ error: 'Internal server error' });
                });
        })
        .catch(error => {
            console.error(`Error querying devices for ${location}:`, error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.get('/device/all/detail', (req, res) => {
    // Query to retrieve unique device values
    const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device"`;

    influx.query(deviceQuery)
        .then(deviceResult => {
            // ใช้ Set เพื่อกรอง devices ที่ไม่ซ้ำกัน
            const uniqueDevices = new Set(deviceResult.map(deviceEntry => deviceEntry.value));
            // แปลง Set เป็น array
            const devices = [...uniqueDevices];

            // เพิ่มการค้นหาข้อมูลทั้งหมดจากทุกอุปกรณ์ (Device)
            const promises = devices.map(device => {
                const query = `SELECT TotalPowerGen, MPPTBatteryVoltage, DCOutputStatus, ChargingStatus, InTemp FROM realtimedata WHERE "Device" = '${device}' LIMIT 1`;
                return influx.query(query);
            });

            // รอให้ทุกคำสั่งคิวรีเสร็จสิ้นและรวมผลลัพธ์
            Promise.all(promises)
                .then(results => {
                    // สร้างอาเรย์ของผลลัพธ์ที่ได้จากการค้นหาข้อมูลทั้งหมดของทุกอุปกรณ์
                    const allData = results.map((result, index) => ({
                        device: devices[index],
                        data: result
                    }));
                    res.json({ allData: allData });
                })
                .catch(error => {
                    console.error(`Error querying all data for all devices:`, error);
                    res.status(500).json({ error: 'Internal server error' });
                });
        })
        .catch(error => {
            console.error(`Error querying devices for all devices:`, error);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.get('/device/summary', (req, res) => {
    // Query to retrieve unique device values
    const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device"`;

    influx.query(deviceQuery)
        .then(deviceResult => {
            // ใช้ Set เพื่อกรอง devices ที่ไม่ซ้ำกัน
            const uniqueDevices = new Set(deviceResult.map(deviceEntry => deviceEntry.value));
            // แปลง Set เป็น array
            const devices = [...uniqueDevices];

            // เพิ่มการค้นหาข้อมูลทั้งหมดจากทุกอุปกรณ์ (Device)
            const promises = devices.map(device => {
                const query = `SELECT * FROM realtimedata WHERE "Device" = '${device}' LIMIT 1`;
                return influx.query(query);
            });

            // รอให้ทุกคำสั่งคิวรีเสร็จสิ้นและรวมผลลัพธ์
            Promise.all(promises)
                .then(results => {
                    // สร้างอาเรย์ของผลลัพธ์ที่ได้จากการค้นหาข้อมูลทั้งหมดของทุกอุปกรณ์
                    const allData = results.map((result, index) => ({
                        device: devices[index],
                        data: result
                    }));
                    res.json({ allData: allData });
                })
                .catch(error => {
                    console.error(`Error querying all data for all devices:`, error);
                    res.status(500).json({ error: 'Internal server error' });
                });
        })
        .catch(error => {
            console.error(`Error querying devices for all devices:`, error);
            res.status(500).json({ error: 'Internal server error' });
        });
});


app.get('/device/province/graph', (req, res) => {
    const { location, data } = req.query; // รับชื่อ Location และชื่อ _field จาก request param

    if (!location) {
        return res.status(400).json({ error: 'Location parameter is required' });
    }

    if (!data) {
        return res.status(400).json({ error: 'Field parameter is required' });
    }

    // Query to retrieve unique device values based on the specified Location
    const deviceQuery = `SHOW TAG VALUES WITH KEY = "Device" WHERE "Location" = '${location}'`;

    influx.query(deviceQuery)
        .then(deviceResult => {
            // ใช้ Set เพื่อกรอง devices ที่ไม่ซ้ำกัน
            const uniqueDevices = new Set(deviceResult.map(deviceEntry => deviceEntry.value));
            // แปลง Set เป็น array
            const devices = [...uniqueDevices];

            // เพิ่มการค้นหาข้อมูลทั้งหมดจากทุกอุปกรณ์ (Device) เฉพาะ Location ที่ระบุ
            const promises = devices.map(device => {
                const query = `SELECT time, "${data}" FROM realtimedata WHERE "Location" = '${location}' AND "Device" = '${device}' `;
                return influx.query(query);
            });

            // รอให้ทุกคำสั่งคิวรีเสร็จสิ้นและรวมผลลัพธ์
            Promise.all(promises)
                .then(results => {
                    // สร้างอาเรย์ของผลลัพธ์ที่ได้จากการค้นหาข้อมูลทั้งหมดของทุกอุปกรณ์
                    const allData = results.map((result, index) => ({
                        device: devices[index],
                        '[time,data]': result.map(entry => [entry.time, entry[data]])
                    }));
                    res.json({ location: location, allData: allData });
                })
                .catch(error => {
                    console.error(`Error querying all data for ${location}:`, error);
                    res.status(500).json({ error: 'Internal server error' });
                });
        })
        .catch(error => {
            console.error(`Error querying devices for ${location}:`, error);
            res.status(500).json({ error: 'Internal server error' });
        });
});




  
    // Start the Express server
    const PORT = process.env.PORT || 9000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    