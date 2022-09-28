const cheerio = require("cheerio");
const axios = require("axios");
const cron = require('node-cron');
const bca = "https://www.klikbca.com/";


let data_nilai = [];
const margin_persen = 10;

function hitungMargin(margin, jual, harga) { 
  const totalMargin = (parseFloat(harga) * margin) / 100;
  const totalHarga = jual
    ? parseFloat(harga) + totalMargin
    : parseFloat(harga) - totalMargin;
  return { totalMargin: totalMargin.toString(16), totalHarga: totalHarga.toString(16) };
}

async function getKurs(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const nilai = $("table table table table table table table tr");
    nilai.each(function () {
      const data_kurs = $(this).find("td.kurs:nth-child(1)").text();
      const data_beli = $(this)
        .find("td.kurs:nth-child(2)")
        .text()
        .replace(".", "")
        .replace(",", ".");
      const data_jual = $(this)
        .find("td.kurs:nth-child(3)")
        .text()
        .replace(".", "")
        .replace(",", ".");

      const jual = hitungMargin(margin_persen, true, data_jual);
      const beli = hitungMargin(margin_persen, false, data_beli);

      data_nilai.push({
        data_kurs,
        nilai_jual_awal: parseFloat(data_jual),
        nilai_beli_awal: parseFloat(data_beli), 
        //nilai_jual_akhir: jual.totalHarga,
        //nilai_beli_akhir: beli.totalHarga,
        //margin_beli: beli.totalMargin,
        //margin_jual: jual.totalMargin,
      });
    });
  
    console.log(data_nilai);
  } catch (err) {
    console.error(err);
  }
}

cron.schedule('5 * * * * *', function() {
  console.log('mengambil data')
  getKurs(bca);

});
