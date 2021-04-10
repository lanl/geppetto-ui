#!/usr/bin/env python3

import os
import logging
import magic
import requests
from requests_toolbelt.multipart.encoder import MultipartEncoder, MultipartEncoderMonitor
from argparse import ArgumentParser
from tqdm import tqdm


class GeppettoUploader:
    def __init__(self, geppetto_url):
        self.url = geppetto_url

    def upload(self, fname, tags):
        with magic.Magic(flags=magic.MAGIC_MIME_TYPE) as m:
            mime = m.id_filename(fname)

        if mime.startswith('image/'):
            logging.info(f'Uploading file with type: {mime}')
        elif mime.startswith('video/'):
            logging.info(f'Uploading video with type: {mime}')
        else:
            raise ValueError('File type does not appear to be an image or video: ', mime)

        with open(fname, 'rb') as f:
            encoder = MultipartEncoder(fields=dict(
                probe=(os.path.basename(fname), f, mime),
                tags=','.join(tags)
            ))

            with tqdm(encoder, unit='B', unit_scale=True, unit_divisor=1024) as pbar:
                def callback(monitor):
                    delta = pbar.n - monitor.bytes_read
                    pbar.update(delta)

                monitor = MultipartEncoderMonitor(encoder, callback)
                headers = {'Content-Type': monitor.content_type}

                response = requests.post(self.url.rstrip('/') + '/upload', data=monitor, headers=headers)

            if response.status_code == 201:
                logging.info('Upload successful')
            else:
                raise RuntimeError(f'Upload failed with status code {response.status_code}')


def main():
    parser = ArgumentParser('Upload a file to Geppetto')
    parser.add_argument('filename', help='File to upload')
    parser.add_argument('--url', '-u', required=True, help='Base URL for Geppetto')
    parser.add_argument('--tags', '-t', action='append', help='Tag(s) to apply')

    args = parser.parse_args()

    geppetto = GeppettoUploader(args.url)

    fname = os.path.abspath(args.filename)
    if not os.path.isfile(fname):
        raise ValueError(f'File {fname} does not exist.')

    geppetto.upload(fname, args.tags)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    main()
