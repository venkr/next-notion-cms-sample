import Link from "next/link";

export default function Home() {
  return (
    <div>
      hello! welcome to this template. as you can see, the home page is pretty empty - thats for you to design yourself.
      <br/>
      here is a link to the <Link href="/blog">blog</Link>, which draws from the primary post list. and here is a <Link href="/recipes">recipes</Link> list, another section of the blog.
      <br/>
      also, this is a <Link href="/blog/hidden-post">hidden post</Link> that will not show up in the blog list.
    </div>
  );
}
