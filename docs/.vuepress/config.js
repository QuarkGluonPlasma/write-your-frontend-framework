
module.exports = {
	title: '手写你的前端框架',
	description: '从 0 到 1 手写前端框架',
	base: '',
	themeConfig: {
		"repo": "QuarkGluonPlasma/write-your-frontend-framework",
		"repoLabel": "点亮⭐不迷路",
		"editLinks": true,
		"docsDir": "docs",
		"editLinkText": "为该章节纠错",
		"lastUpdated": "上次更新",
		sidebar: [
			{
				title: 'Dong1.0',
				link: '/dong1.0',
				children: [
					[
						'/dong1.0.md',
						'导读',
					],
					[
						'/Dong1.0/vdom-render.md',
						'实现 vdom 渲染和 jsx 编译'
					],
					[
						'/Dong1.0/component.md',
						'实现组件'
					],
					[
						'/Dong1.0/patch.md',
						'实现 patch'
					]
				]
			},
			
		],
		nav: [
			{
				"text": "🙋‍♂️ 一起成长",
				"link": "/me"
			}
		]
	}
}