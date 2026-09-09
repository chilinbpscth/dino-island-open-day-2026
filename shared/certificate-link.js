// Apps Script may return an owner-domain URL. Keep the same deployment but
// use its public route so families do not inherit the school's account route.
export function certificateLink(result,expected,now=Date.now()){
 const fail=()=>{throw Error('下載連結驗證未完成');};
 const parse=value=>{let url;try{url=new URL(value);}catch{return fail();}if(url.origin!=='https://script.google.com'||url.username||url.password||url.hash)return fail();const path=url.pathname.match(/^\/(?:a\/[a-zA-Z0-9.-]+\/)?macros\/s\/([\w-]+)\/exec$/);if(!path)return fail();return {url,id:path[1]};};
 const configured=parse(expected),returned=parse(result?.url);
 const params=returned.url.searchParams,token=params.get('token');
 if(configured.id!==returned.id||params.get('view')!=='certificate'||params.getAll('view').length!==1||params.getAll('token').length!==1||[...params.keys()].some(k=>k!=='view'&&k!=='token')||!/^[\w-]{40,100}$/.test(token||'')||!Number.isFinite(result.expiresAt)||result.expiresAt<=now)return fail();
 return `https://script.google.com/macros/s/${configured.id}/exec?view=certificate&token=${encodeURIComponent(token)}`;
}
