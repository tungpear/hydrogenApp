import {
  CacheLong,
  Image,
  Seo,
  useLocalization,
  useShopQuery,
} from '@shopify/hydrogen';
import {Suspense} from 'react';
import {CustomFont, PageHeader, Section} from 'client-comp';
import {Layout, NotFound} from '../../components/server';
import {ATTR_LOADING_EAGER} from 'lib';
import {ARTICLE_QUERY} from 'graphql-query';

const BLOG_HANDLE = 'journal';

export default function Post({params, response}) {
  response.cache(CacheLong());
  const {
    language: {isoCode: languageCode},
    country: {isoCode: countryCode},
  } = useLocalization();

  const {handle} = params;
  const {data} = useShopQuery({
    query: ARTICLE_QUERY,
    variables: {
      language: languageCode,
      blogHandle: BLOG_HANDLE,
      articleHandle: handle,
    },
  });

  if (!data?.blog?.articleByHandle) {
    return <NotFound />;
  }

  const {title, publishedAt, contentHtml, author} = data.blog.articleByHandle;
  const formattedDate = new Intl.DateTimeFormat(
    `${languageCode}-${countryCode}`,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  ).format(new Date(publishedAt));

  return (
    <Layout>
      {/* Loads Fraunces custom font only on articles */}
      <CustomFont />
      <Suspense>
        {/* @ts-expect-error Blog article types are not supported in TS */}
        <Seo type="page" data={data.blog.articleByHandle} />
      </Suspense>
      <PageHeader heading={title} variant="blogPost">
        <span>
          {formattedDate} &middot; {author.name}
        </span>
      </PageHeader>
      <Section as="article" padding="x">
        {data.blog.articleByHandle.image && (
          <Image
            data={data.blog.articleByHandle.image || '/src/assets/favicon.ico'}
            className="w-full mx-auto mt-8 md:mt-16 max-w-7xl"
            sizes="90vw"
            widths={[400, 800, 1200]}
            width="100px"
            loading={ATTR_LOADING_EAGER}
            loaderOptions={{
              scale: 2,
              crop: 'center',
            }}
          />
        )}
        <div
          dangerouslySetInnerHTML={{__html: contentHtml}}
          className="article"
        />
      </Section>
    </Layout>
  );
}
