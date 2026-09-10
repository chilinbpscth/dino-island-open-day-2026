import {certificateLink} from '../shared/certificate-link.js';

// Synthetic artwork only: this test must never capture a child's photograph.
export function testCertificate(){
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=2000;
 const c=canvas.getContext('2d');c.fillStyle='#F6F3EC';c.fillRect(0,0,1600,2000);
 c.strokeStyle='#b8923a';c.lineWidth=24;c.strokeRect(48,48,1504,1904);
 c.fillStyle='#146b4d';c.textAlign='center';c.font='bold 90px sans-serif';
 c.fillText('智取恐龍島',800,350);c.fillText('測試證書 · 非來賓相片',800,600);
 c.font='60px sans-serif';c.fillText('佛教志蓮小學',800,850);
 c.fillText('2026.09.13',800,1100);c.fillText('傳輸及圖片完整性測試',800,1450);
 return canvas.toDataURL('image/jpeg',0.88);
}

export async function verifyCertificate(upload,download,request,endpoint){
 const result=await upload('uploadCertificate',request);
 const url=certificateLink(result,endpoint);
 const received=await download('getCertificate',{token:new URL(url).searchParams.get('token')});
 if(received.image!==request.image)throw Error('下載圖片與上傳內容不一致');
 if(received.expiresAt!==result.expiresAt)throw Error('下載到期時間與上傳回覆不一致');
 const image=new Image();image.src=received.image;await image.decode();
 if(image.naturalWidth!==1600||image.naturalHeight!==2000)throw Error('證書圖片尺寸不正確');
 return {requestId:request.requestId,expiresAt:result.expiresAt,width:image.naturalWidth,height:image.naturalHeight,
  verified:['上傳回覆連結有效','下載請求無裝置憑證','下載內容完全一致','JPEG 可解碼及尺寸正確'],
  unverified:['家長手機免登入下載頁','QR 掃描','Drive 分享權限','七日到期與排程清理','正式拍照證書合成']};
}
