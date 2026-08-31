export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <article>
      <h1>post: {slug}</h1>
      <p>文章详情。待接入数据层后填充。</p>
      <p>
        <a href="/blog">← back to blog</a>
      </p>
    </article>
  );
}
