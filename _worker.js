// 处理QQ音乐请求
async function handleQQMusic(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const t = searchParams.get('t') || '0';

    try {
        const response = await fetch(`${env.QQ_MUSIC_API}${id}`);
        const data = await response.json();
        
        if (data.code !== 200) throw new Error('API异常');
        
        return new Response(JSON.stringify({
            code: 200,
            cover: data.data.cover,
            title: data.data.song,
            artist: data.data.singer,
            album: data.data.album,
            subtitle: data.data.subtitle,
            time: data.data.time,
            link: data.data.link,
            id: data.data.id,
            mid: data.data.mid,
            vid: data.data.vid,
            type: t
        }), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({
            code: 500,
            msg: '处理失败'
        }), { status: 500 });
    }
}

// 处理代理请求
async function handleProxy(request, env) {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const id = searchParams.get('id');

    const API_MAP = {
        '1': env.QQ_LYRIC_API,
        '2': env.NETEASE_API,
        '3': env.KUWO_API
    };

    try {
        const response = await fetch(`${API_MAP[platform]}${id}`);
        const data = await response.json();

        // 网易云处理
        if (platform === '2') {
            return new Response(JSON.stringify({
                code: 200,
                cover: data.cover,
                title: data.title,
                artist: data.singer,
                lyric: data.lrc || '暂无歌词'
            }), { headers: { 'Content-Type': 'application/json' } });
        }
        // 酷我处理
        else if (platform === '3') {
            return new Response(JSON.stringify({
                code: 200,
                cover: data.data.pic,
                title: data.data.name,
                artist: data.data.artist,
                album: data.data.album,
                lyric: data.data.lrc || '暂无歌词'
            }), { headers: { 'Content-Type': 'application/json' } });
        }
        // QQ音乐歌词
        else {
            return new Response(JSON.stringify({
                code: 200,
                lyric: data.data?.lrc || '暂无歌词'
            }), { headers: { 'Content-Type': 'application/json' } });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            code: 500,
            msg: '服务器错误'
        }), { status: 500 });
    }
}

// 主路由
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        if (url.pathname === '/api/qqmusic') {
            return handleQQMusic(request, env);
        } else if (url.pathname === '/api/proxy') {
            return handleProxy(request, env);
        }
        
        // 静态文件请求
        return fetch(request);
    }
};
