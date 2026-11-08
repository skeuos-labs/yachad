import { exportPresentation, exportLibrary } from '@skeuos-labs/mizmor';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const pres = {
    id: 'yachad-test-hymn-01',
    title: 'Yachad Test Hymn',
    sourceFormat: 'unknown',
    metadata: {
      author: 'Skeuos Labs & John Newton',
      ccli: '7777777',
      copyright: 'Public Domain / CC0',
      notes: 'Yachad live application compatibility test presentation',
    },
    sections: [
      { id: 'sec-v1', name: 'Verse 1', slideIds: ['slide-v1'] },
      { id: 'sec-ch', name: 'Chorus', slideIds: ['slide-ch'] },
      { id: 'sec-v2', name: 'Verse 2', slideIds: ['slide-v2'] },
      { id: 'sec-br', name: 'Bridge', slideIds: ['slide-br'] },
    ],
    arrangements: [
      { id: 'arr-default', name: 'Default', slideIds: ['slide-v1', 'slide-ch', 'slide-v2', 'slide-br', 'slide-ch'] },
    ],
    slides: [
      { id: 'slide-v1', label: 'V1', items: [{ type: 'text', plainText: 'Façade de grâce et de lumière\nAndroany no andro lehibe' }] },
      { id: 'slide-ch', label: 'Chorus', items: [{ type: 'text', plainText: "Miderà ny Tompo mandrakizay\nC'est un rempart que notre Dieu" }] },
      { id: 'slide-v2', label: 'V2', items: [{ type: 'text', plainText: 'A thousand generations falling down in worship\nTo the Lamb who was slain for all' }] },
      { id: 'slide-br', label: 'Bridge', items: [{ type: 'text', plainText: 'Holy forever, your name is the highest\nHallelujah, amen, amen' }] },
    ],
    warnings: [],
  };

  const proRes = await exportPresentation(pres, 'pro');
  const showRes = await exportPresentation(pres, 'freeshow');
  const vpcRes = await exportLibrary({ presentations: [pres] }, 'vpc');

  const proDir = 'D:/someone/Documents/ProPresenter/Libraries/Yachad_Test';
  const showDir = 'D:/someone/Documents/FreeShow/Shows/Yachad_Test';
  const vpcDir = 'C:/Users/Public/Documents/VideoPsalm/SongBooks';

  fs.mkdirSync(proDir, { recursive: true });
  fs.mkdirSync(showDir, { recursive: true });
  fs.mkdirSync(vpcDir, { recursive: true });

  fs.writeFileSync(path.join(proDir, 'Yachad_Test_Hymn.pro'), Buffer.from(proRes.value.bytes));
  fs.writeFileSync(path.join(showDir, 'Yachad_Test_Hymn.show'), Buffer.from(showRes.value.bytes));
  fs.writeFileSync(path.join(vpcDir, 'Yachad_Test.vpc'), Buffer.from(vpcRes.value.bytes));

  console.log('SUCCESS: Written test files directly to host application folders:');
  console.log('ProPresenter: ' + path.join(proDir, 'Yachad_Test_Hymn.pro'));
  console.log('FreeShow:     ' + path.join(showDir, 'Yachad_Test_Hymn.show'));
  console.log('VideoPsalm:   ' + path.join(vpcDir, 'Yachad_Test.vpc'));
}

main().catch(console.error);
