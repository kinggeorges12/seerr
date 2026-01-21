9
import { MediaRequest, RequestPermissionError, QuotaRestrictedError, DuplicateMediaRequestError, NoSeasonsAvailableError, BlacklistedMediaError } from '@server/entity/MediaRequest';
import type { MediaRequestBody } from '@server/interfaces/api/requestInterfaces';

374
router.post<{ id: string }, MediaRequest, MediaRequestBody>(
  '/:id/request',
  isAuthenticated(Permission.ADMIN),
  async (req, res, next) => {
    try {
      // Copied from /:id/requests
      const user = await getRepository(User).findOneOrFail({
        where: { id: Number(req.params.id) },
      });

      if (!user) {
        return next({ status: 404, message: 'User not found.' });
      }

      const request = await MediaRequest.request(req.body, user);

      return res.status(201).json(request);
    } catch (error) {
      if (!(error instanceof Error)) {
        return;
      }

      switch (error.constructor) {
        case RequestPermissionError:
        case QuotaRestrictedError:
          return next({ status: 403, message: error.message });
        case DuplicateMediaRequestError:
          return next({ status: 409, message: error.message });
        case NoSeasonsAvailableError:
          return next({ status: 202, message: error.message });
        case BlacklistedMediaError:
          return next({ status: 403, message: error.message });
        default:
          return next({ status: 500, message: error.message });
      }
    }
  }
);

