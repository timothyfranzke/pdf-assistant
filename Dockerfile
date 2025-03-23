FROM postgres:14

# Install pgvector extension
RUN apt-get update \
    && apt-get install -y postgresql-server-dev-14 build-essential git \
    && git clone https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make \
    && make install

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=pdf_ai_tutor