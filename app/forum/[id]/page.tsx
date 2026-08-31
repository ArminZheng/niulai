export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <article>
      <h1>topic: {id}</h1>
      <p>话题详情与回复。待接入数据层后填充。</p>
      <p>
        <a href="/forum">← back to forum</a>
      </p>
    </article>
  );
}
