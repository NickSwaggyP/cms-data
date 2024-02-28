const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// 图表数据本地接口
app.get('/api/json-files', (req, res) => {
  const folderPath = './图表数据'; // 文件夹路径
  const files = fs.readdirSync(folderPath)
    .filter((file) => file.startsWith('cms') && file.endsWith('.json'))
    .map((file) => {
      const filePath = path.join(folderPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return {
        name: file,
        content: fileContent
      };
    });

  res.json(files);
});

// 表格数据本地接口
app.get('/api/json-forms', (req, res) => {
    const folderPath = './表格数据'; // 文件夹路径
    const files = fs.readdirSync(folderPath)
      .filter((file) => file.startsWith('cms') && file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(folderPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return {
          name: file,
          content: fileContent
        };
      });
  
    res.json(files);
  });

app.listen(3000, () => {
  console.log('Server is running on port 5500');
});     