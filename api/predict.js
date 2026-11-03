// api/predict.js
export default async function handler(req, res) {
    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '허용되지 않은 메서드입니다. POST를 사용하세요.' });
    }

    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ message: '이미지 데이터가 없습니다.' });
        }

        // 환경변수에서 Roboflow API 키와 엔드포인트 로드
        const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
        const ROBOFLOW_ENDPOINT = process.env.ROBOFLOW_ENDPOINT;

        if (!ROBOFLOW_API_KEY || !ROBOFLOW_ENDPOINT) {
            return res.status(500).json({ message: '서버 환경변수가 설정되지 않았습니다.' });
        }

        // 프론트에서 보낸 'data:image/jpeg;base64,...' 문자열에서 Base64 순수 데이터만 추출
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // Roboflow Cloud Workflow API 호출 (HTTP POST / application/x-www-form-urlencoded)
        const response = await fetch(`${ROBOFLOW_ENDPOINT}?api_key=${ROBOFLOW_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: base64Data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Roboflow API Error:", errorText);
            return res.status(response.status).json({ message: 'Roboflow API 호출에 실패했습니다.', details: errorText });
        }

        const data = await response.json();
        
        // 원본 응답을 그대로 클라이언트에 전달 (클라이언트에서 파싱)
        return res.status(200).json(data);

    } catch (error) {
        console.error("서버 내부 오류:", error);
        return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.', error: error.toString() });
    }
}