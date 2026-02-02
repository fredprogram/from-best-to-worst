import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { category, count = 5 } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: '请输入类别' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY 环境变量未配置');
    }

    const systemPrompt = `你是一个专业的标签生成助手。你的任务是根据用户提供的类别，生成真实、准确、知名的品牌或项目名称列表。

要求：
1. 只生成真实的品牌、产品、公司或项目名称
2. 不要生成广告内容、推广信息或虚假内容
3. 品牌名称要准确、真实、知名度高
4. 返回格式必须是有效的JSON数组，每个元素包含：
   - name: 品牌名称（字符串）
   - type: 标签类型（text、image或mixed，默认text）
5. 数量要准确匹配用户要求
6. 不要添加任何额外的文字说明，只返回JSON数组`;

    const userPrompt = `请为"${category}"这个类别生成${count}个知名品牌或项目名称的JSON列表。只返回JSON数组，不要其他内容。`;

    console.log('调用 DeepSeek API，类别:', category);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API 错误:', response.status, errorText);
      throw new Error(`DeepSeek API 请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API 响应:', data);

    const content = data.choices[0].message.content;

    // 解析AI返回的JSON
    let parsedData: any;
    try {
      parsedData = JSON.parse(content);
    } catch (e) {
      // 如果失败，尝试提取JSON部分
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回的数据');
      }
    }

    // 转换为标签格式
    const tags = [];
    const items = Array.isArray(parsedData) ? parsedData : [];

    for (let i = 0; i < Math.min(count, items.length); i++) {
      const item = items[i];
      const name = item.name || item.brand || item.content || String(item);

      tags.push({
        id: `ai-${Date.now()}-${i}`,
        type: 'text',
        content: name.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    console.log('成功生成标签:', tags);

    return NextResponse.json({
      success: true,
      tags,
      summary: `已为您生成${tags.length}个${category}相关的标签`,
      usedAI: true,
      provider: 'deepseek',
    });
  } catch (error) {
    console.error('生成标签失败:', error);
    return NextResponse.json(
      {
        error: '生成标签失败，请稍后重试',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
